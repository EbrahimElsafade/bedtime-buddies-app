import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { supabase } from '@/integrations/supabase/client'

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

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoPath) return

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
        // Get the public URL from Supabase storage
        const { data } = supabase.storage
          .from('course-videos')
          .getPublicUrl(videoPath)

        const videoUrl = data.publicUrl
        const isHLS = videoPath.endsWith('.m3u8')

        if (isHLS && Hls.isSupported()) {
          // Use HLS.js for HLS streams
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: true,
          })
          
          hlsRef.current = hls
          hls.loadSource(videoUrl)
          hls.attachMedia(video)

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
                  setError('Failed to load video stream')
                  break
              }
            }
          })
        } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari, which has native HLS support
          video.src = videoUrl
        } else {
          // For regular MP4/video files
          video.src = videoUrl
        }

        // Initialize Plyr after video source is set
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
        console.error('Error initializing video player:', err)
        setError('Failed to initialize video player')
      }
    }

    initializePlayer()

    // Cleanup
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
  }, [videoPath, muted, title])

  if (error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-black/80 text-white rounded-lg ${className}`}>
        <p>{error}</p>
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