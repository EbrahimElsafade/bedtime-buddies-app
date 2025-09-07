import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth header for the client
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    const { lessonId } = await req.json();

    if (!lessonId) {
      throw new Error('Lesson ID is required');
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile to check subscription
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_premium, subscription_end')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabaseClient
      .from('course_lessons')
      .select(`
        id,
        video_path,
        course_id,
        courses (
          is_free,
          is_published
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new Error('Lesson not found');
    }

    // Check if course is published
    if (!lesson.courses?.is_published) {
      throw new Error('Course not available');
    }

    // Check access permissions
    const hasAccess = lesson.courses?.is_free || 
      (profile.is_premium && 
       (!profile.subscription_end || new Date(profile.subscription_end) > new Date()));

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          error: 'Premium subscription required',
          requiresSubscription: true 
        }), 
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If no video_path, this lesson might use external video (like YouTube)
    if (!lesson.video_path) {
      return new Response(
        JSON.stringify({ 
          error: 'No secure video available for this lesson',
          hasVideo: false 
        }), 
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate signed URL (expires in 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient
      .storage
      .from('course-videos')
      .createSignedUrl(lesson.video_path, 300); // 5 minutes

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      throw new Error('Failed to generate video URL');
    }

    console.log(`Generated signed URL for user ${user.id}, lesson ${lessonId}`);

    return new Response(
      JSON.stringify({ 
        videoUrl: signedUrlData.signedUrl,
        expiresIn: 300 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-video-url function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});