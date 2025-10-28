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
      title={title}
    //   loop
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.play()
        }
      }}
    >
      <source src={getVideoUrl(videoPath)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer
