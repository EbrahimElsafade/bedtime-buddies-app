import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

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
      // just update the src, not reload()
      const source = videoRef.current.querySelector('source')
      if (source) {
        source.setAttribute('src', getVideoUrl(videoPath))
        videoRef.current.load() // optional: only if needed
      }
    }
  }, [videoPath])

  // Allow natural buffering - don't interfere with mobile playback

  // Get video URL from Supabase storage
  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('course-videos').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <video
      key={videoPath}
      ref={videoRef}
      className={`aspect-[16/9] h-full w-full rounded-xl object-cover ${className}`}
      style={{ objectFit: 'cover' }}
      controls={false}
      muted
      loop
      playsInline
      preload="metadata"
      title={title}
      webkit-playsinline="true"
      x5-playsinline="true"
      onClick={() => {
        if (videoRef.current) {
          videoRef.current
            .play()
            .catch(err => logger.warn('Video play failed:', err))
        }
      }}
    >
      <source src={getVideoUrl(videoPath)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer
