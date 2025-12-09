import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscodeRequest {
  videoPath: string;
  courseId: string;
  lessonOrder: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { videoPath, courseId, lessonOrder }: TranscodeRequest = await req.json();
    
    if (!videoPath || !courseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: videoPath, courseId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting transcode for video: ${videoPath}, course: ${courseId}, lesson: ${lessonOrder}`);

    // Download the original video from storage
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('course-videos')
      .download(videoPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: `Failed to download video: ${downloadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Video downloaded, size: ${videoData.size} bytes`);

    // For edge functions, we'll use a simplified approach:
    // Since FFmpeg isn't available in Deno Deploy, we'll store the original video
    // and create a manifest that points to it for direct playback
    // In a production environment, you'd want to use a service like Mux or Cloudflare Stream
    
    const timestamp = Date.now();
    const hlsFolder = `${courseId}/lesson-${lessonOrder}-${timestamp}`;
    
    // Upload the original video to a new location
    const videoFileName = `video.mp4`;
    const { error: uploadVideoError } = await supabase.storage
      .from('course-videos')
      .upload(`${hlsFolder}/${videoFileName}`, videoData, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'video/mp4',
      });

    if (uploadVideoError) {
      console.error('Video upload error:', uploadVideoError);
      return new Response(
        JSON.stringify({ error: `Failed to upload processed video: ${uploadVideoError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the video
    const { data: publicUrlData } = supabase.storage
      .from('course-videos')
      .getPublicUrl(`${hlsFolder}/${videoFileName}`);

    const videoUrl = publicUrlData.publicUrl;

    // Create a simple HLS manifest pointing to the video
    // This is a basic manifest - for true HLS with segments, you'd need FFmpeg
    const hlsManifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:30
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:30.0,
${videoUrl}
#EXT-X-ENDLIST`;

    // Upload the HLS manifest
    const manifestPath = `${hlsFolder}/playlist.m3u8`;
    const { error: manifestError } = await supabase.storage
      .from('course-videos')
      .upload(manifestPath, new Blob([hlsManifest], { type: 'application/x-mpegURL' }), {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/x-mpegURL',
      });

    if (manifestError) {
      console.error('Manifest upload error:', manifestError);
      return new Response(
        JSON.stringify({ error: `Failed to upload manifest: ${manifestError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally delete the original upload if it's different from the new location
    if (videoPath !== `${hlsFolder}/${videoFileName}`) {
      await supabase.storage
        .from('course-videos')
        .remove([videoPath]);
    }

    console.log(`Transcode complete. Manifest at: ${manifestPath}`);

    return new Response(
      JSON.stringify({
        success: true,
        hlsPath: manifestPath,
        message: 'Video processed successfully',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Transcode error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
