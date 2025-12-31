import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const allowedOrigins = [
  'https://dolphoon.com',
  'https://www.dolphoon.com',
  'https://brxbtgzaumryxflkykpp.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

interface TranscodeRequest {
  videoPath: string;
  courseId: string;
  lessonOrder: number;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { videoPath, courseId, lessonOrder }: TranscodeRequest = await req.json();
    
    if (!videoPath || !courseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Triggering GitHub Actions for video conversion:');
    console.log(`  Course ID: ${courseId}`);
    console.log(`  Lesson Order: ${lessonOrder}`);
    console.log(`  Video Path: ${videoPath}`);

    // Update lesson status to "processing"
    const { error: updateError } = await supabase
      .from('course_lessons')
      .update({ video_path: videoPath })
      .eq('course_id', courseId)
      .eq('lesson_order', lessonOrder);

    if (updateError) {
      console.error('Failed to update lesson status:', updateError);
    }

    // Trigger GitHub Actions workflow
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Service configuration error. Please contact support.',
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const githubApiUrl = 'https://api.github.com/repos/abdul-RahmanAlaa/convert_to_hsl/dispatches';
    
    console.log(`Calling GitHub API: ${githubApiUrl}`);

    const githubResponse = await fetch(githubApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'convert-video',
        client_payload: {
          video_path: videoPath,
          course_id: courseId,
          lesson_order: lessonOrder,
          supabase_url: supabaseUrl,
        },
      }),
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error('GitHub API error:', githubResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Video processing service unavailable. Please try again later.',
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ GitHub Actions workflow triggered successfully');

    return new Response(
      JSON.stringify({
        success: true,
        hlsPath: videoPath,
        message: 'Video conversion started. The HLS version will be available shortly.',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Transcode error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.', 
        success: false 
      }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), 'Content-Type': 'application/json' } }
    );
  }
});
