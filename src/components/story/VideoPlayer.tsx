import { useEffect, useRef } from 'react'
import { logger } from '@/utils/logger'
import { useSignedVideoUrl } from '@/hooks/useSignedVideoUrl'

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
  const { url: videoUrl, loading } = useSignedVideoUrl(videoPath)

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current)
    }
  }, [onVideoRef])

  // Reset video when videoUrl changes (section switch)
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      const source = videoRef.current.querySelector('source')
      if (source) {
        source.setAttribute('src', videoUrl)
        videoRef.current.load()
      }
    }
  }, [videoUrl])

  if (loading || !videoUrl) {
    return (
      <div className={`flex aspect-[16/9] h-full w-full items-center justify-center rounded-xl bg-black/80 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <video
      key={videoUrl}
      ref={videoRef}
      className={`aspect-[16/9] h-full w-full rounded-xl object-cover ${className}`}
      style={{ objectFit: 'cover' }}
      controls={false}
      muted
      playsInline
      preload="auto"
      title={title}
      webkit-playsinline="true"
      x5-playsinline="true"
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer
