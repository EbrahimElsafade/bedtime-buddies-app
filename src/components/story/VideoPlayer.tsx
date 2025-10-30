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

  // Get video URL from Supabase storage
  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('course-videos').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <video
      ref={videoRef}
      className={`h-full w-full object-cover ${className}`}
      controls={true}
      playsInline
      preload="auto"
      title={title}
    >
      <source src={getVideoUrl(videoPath)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer
