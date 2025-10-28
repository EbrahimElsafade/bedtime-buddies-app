import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface VideoPlayerProps {
  videoPath: string
  title: string
  className?: string
  onVideoRef?: (ref: HTMLVideoElement | null) => void
  playOnTouch?: boolean
}

const VideoPlayer = ({ videoPath, title, className = '', onVideoRef, playOnTouch = false }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  // Get video URL from Supabase storage
  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage
      .from('course-videos')
      .getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      controls={!playOnTouch}
      muted={true}
      playsInline
      title={title}
    >
      <source src={getVideoUrl(videoPath)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer