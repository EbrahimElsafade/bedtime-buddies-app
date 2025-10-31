import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface VideoPlayerProps {
  videoPath: string
  title: string
  className?: string
  onVideoRef?: (ref: HTMLVideoElement | null) => void
}

const VideoPlayer = ({
  videoPath,
  title,
  className = '',
  onVideoRef,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  // Reset video when videoPath changes (section switch)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.load()
    }
  }, [videoPath])

  // Prevent video from stopping on mobile
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleStalled = () => {
      video.load()
    }

    const handleWaiting = () => {
      // Give it a moment to buffer
      setTimeout(() => {
        if (video.readyState < 2) {
          video.load()
        }
      }, 100)
    }

    video.addEventListener('stalled', handleStalled)
    video.addEventListener('waiting', handleWaiting)

    return () => {
      video.removeEventListener('stalled', handleStalled)
      video.removeEventListener('waiting', handleWaiting)
    }
  }, [])

  // Get video URL from Supabase storage
  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('course-videos').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <video
      ref={videoRef}
      className={`h-full w-full object-cover ${className}`}
      controls={false}
      muted={true}
      playsInline
      preload="metadata"
      title={title}
      webkit-playsinline="true"
      x5-playsinline="true"
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => console.warn('Video play failed:', err))
        }
      }}
    >
      <source src={getVideoUrl(videoPath)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer
