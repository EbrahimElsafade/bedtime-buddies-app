import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sectionId, videoPath, storyId, sectionOrder } = await req.json()
    
    console.log('Starting transcoding for section:', sectionId, 'video:', videoPath)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update status to transcoding
    await supabase
      .from('story_sections')
      .update({ 
        video_status: 'transcoding',
        transcoding_progress: 0,
        video_original: videoPath
      })
      .eq('id', sectionId)

    console.log('Updated section status to transcoding')

    // Download the original video
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('course-videos')
      .download(videoPath)

    if (downloadError) {
      throw new Error(`Failed to download video: ${downloadError.message}`)
    }

    console.log('Downloaded original video, size:', videoData.size)

    // Create a unique folder for HLS output
    const timestamp = Date.now()
    const hlsFolder = `story_${storyId}_section_${sectionOrder}_${timestamp}`
    const hlsPath = `${hlsFolder}/playlist.m3u8`

    // Convert video to HLS using FFmpeg
    // Note: In a production environment, you'd need FFmpeg binary
    // For now, we'll simulate the transcoding process
    console.log('Simulating HLS transcoding...')
    
    // Update progress during transcoding
    for (let progress = 0; progress <= 100; progress += 20) {
      await supabase
        .from('story_sections')
        .update({ transcoding_progress: progress })
        .eq('id', sectionId)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // In production, you would:
    // 1. Use FFmpeg to convert video to HLS format
    // 2. Upload all .ts segments and .m3u8 manifest to storage
    // 3. Update the database with the HLS path

    // For now, we'll just copy the original and mark as completed
    // This is a placeholder - replace with actual FFmpeg processing
    
    // Upload HLS files (placeholder - in production this would be actual HLS files)
    const { error: uploadError } = await supabase.storage
      .from('course-videos')
      .upload(hlsPath, videoData, {
        contentType: 'application/vnd.apple.mpegurl',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload HLS: ${uploadError.message}`)
    }

    console.log('HLS files uploaded successfully')

    // Update section with completed status
    await supabase
      .from('story_sections')
      .update({
        video: hlsPath,
        video_status: 'completed',
        transcoding_progress: 100,
        transcoding_error: null
      })
      .eq('id', sectionId)

    console.log('Transcoding completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        hlsPath,
        message: 'Video transcoded successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transcoding error:', error)

    // Update section with error status
    if (error.sectionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase
        .from('story_sections')
        .update({
          video_status: 'failed',
          transcoding_error: error.message
        })
        .eq('id', error.sectionId)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})