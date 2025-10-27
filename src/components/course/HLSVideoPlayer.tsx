import { useEffect, useRef } from 'react'
import Hls, { Events as HlsEvents, ErrorData, ErrorTypes } from 'hls.js'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

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

          const handleError = (_event: HlsEvents, data: ErrorData) => {
            logger.error('HLS error:', data)
            if (data.fatal) {
              switch (data.type) {
                case ErrorTypes.NETWORK_ERROR:
                  logger.warn('Network error, trying to recover...')
                  hls.startLoad()
                  break
                case ErrorTypes.MEDIA_ERROR:
                  logger.warn('Media error, trying to recover...')
                  hls.recoverMediaError()
                  break
                default:
                  logger.error('Fatal error, destroying HLS instance')
                  hls.destroy()
                  break
              }
            }
          }
          
          hls.on(HlsEvents.ERROR, handleError)
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari, which has native HLS support
          video.src = videoUrl
        } else {
          logger.error('HLS is not supported in this browser')
        }
      } catch (error) {
        logger.error('Error initializing video player:', error)
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
      playsInline
      preload="metadata"
      title={title}
      muted
    >
      Your browser does not support the video tag.
    </video>
  )
}

export default HLSVideoPlayer