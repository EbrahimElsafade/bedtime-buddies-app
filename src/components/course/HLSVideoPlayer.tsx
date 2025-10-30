import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { supabase } from '@/integrations/supabase/client'

interface HLSVideoPlayerProps {
  videoPath: string
  title: string
  className?: string
  onVideoRef?: (ref: HTMLVideoElement | null) => void
}

const HLSVideoPlayer = ({ videoPath, title, className = '', onVideoRef }: HLSVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoPath) return

    const initializePlayer = async () => {
      try {
        // Get the public URL from Supabase storage
        const { data } = supabase.storage
          .from('course-videos')
          .getPublicUrl(videoPath)

        const videoUrl = data.publicUrl

        if (Hls.isSupported()) {
          // Use HLS.js for browsers that support it
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: true,
          })
          
          hlsRef.current = hls
          hls.loadSource(videoUrl)
          hls.attachMedia(video)
          
          // hls.on(Hls.Events.MANIFEST_PARSED, () => {
          //   console.log('HLS manifest loaded, ready to play')
          // })

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data)
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...')
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...')
                  hls.recoverMediaError()
                  break
                default:
                  console.log('Fatal error, destroying HLS instance')
                  hls.destroy()
                  break
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari, which has native HLS support
          video.src = videoUrl
        } else {
          console.error('HLS is not supported in this browser')
        }
      } catch (error) {
        console.error('Error initializing video player:', error)
      }
    }

    initializePlayer()

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoPath])

  return (
    <video
      ref={videoRef}
      className={`h-full w-full ${className}`}
      controls={true}
      playsInline
      preload="metadata"
      title={title}
    >
      Your browser does not support the video tag.
    </video>
  )
}

export default HLSVideoPlayer