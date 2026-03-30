import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import Plyr from 'plyr'
import { logger } from '@/utils/logger'
import 'plyr/dist/plyr.css'
import { useSignedVideoUrl } from '@/hooks/useSignedVideoUrl'

interface HLSVideoPlayerProps {
  videoPath: string
  title: string
  className?: string
  muted?: boolean
  controls?: boolean
  onVideoRef?: (ref: HTMLVideoElement | null) => void
}

const HLSVideoPlayer = ({ videoPath, title, className = '', muted = true, controls = true, onVideoRef }: HLSVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const plyrRef = useRef<Plyr | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { url: videoUrl, loading } = useSignedVideoUrl(videoPath)

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    // Cleanup previous instances
    if (plyrRef.current) {
      plyrRef.current.destroy()
      plyrRef.current = null
    }
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    setError(null)

    const initializePlayer = async () => {
      try {
        const isHLS = videoPath.endsWith('.m3u8')

        if (isHLS && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: true,
          })
          
          hlsRef.current = hls
          hls.loadSource(videoUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.ERROR, (event, data) => {
            logger.error('HLS error:', data)
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  logger.debug('Network error, trying to recover...')
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  logger.debug('Media error, trying to recover...')
                  hls.recoverMediaError()
                  break
                default:
                  logger.debug('Fatal error, destroying HLS instance')
                  hls.destroy()
                  setError('Failed to load video stream')
                  break
              }
            }
          })
        } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl
        } else {
          video.src = videoUrl
        }

        if (plyrRef.current) {
          plyrRef.current.destroy()
          plyrRef.current = null
        }
        
        plyrRef.current = new Plyr(video, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'pip',
            'fullscreen',
          ],
          settings: ['quality', 'speed', 'loop'],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
          quality: { default: 720, options: [720, 1080] },
          autoplay: false,
          muted: muted,
          title: title,
        })
      } catch (err) {
        logger.error('Error initializing video player:', err)
        setError('Failed to initialize video player')
      }
    }

    initializePlayer()

    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy()
        plyrRef.current = null
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoUrl, muted, title])

  if (error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-black/80 text-white rounded-lg ${className}`}>
        <p>{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-black/80 rounded-lg ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className={`plyr-react h-full w-full ${className}`}
      muted={muted}
      playsInline
      preload="metadata"
      title={title}
    >
      Your browser does not support the video tag.
    </video>
  )
}

export default HLSVideoPlayer
