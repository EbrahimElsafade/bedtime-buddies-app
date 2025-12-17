import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'

interface VideoPlayerProps {
  videoUrl: string
  title?: string
  className?: string
  autoplay?: boolean
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
  onCountdownCancel?: () => void
}

// Helper to get the proper video URL
const getVideoSource = (videoUrl: string): string => {
  if (!videoUrl) return ''
  
  // If it's already a full URL, use it directly
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl
  }
  
  // Otherwise, assume it's a Supabase storage path
  const { data } = supabase.storage.from('course-videos').getPublicUrl(videoUrl)
  return data.publicUrl
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title = 'Video player',
  className,
  autoplay = false,
  onVideoEnd,
  showCountdownOnEnd = true,
  onCountdownCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const videoSource = getVideoSource(videoUrl)

  const handleCancelCountdown = () => {
    setShowCountdown(false)
    setCountdown(5)
    onCountdownCancel?.()
  }

  // Reset state when videoUrl changes
  useEffect(() => {
    setShowCountdown(false)
    setCountdown(5)
    setError(null)
    setIsLoading(true)
  }, [videoUrl])

  // Handle autoplay when video changes
  useEffect(() => {
    if (autoplay && videoRef.current && !error) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay failed:', err)
      })
    }
  }, [videoUrl, autoplay, error])

  // Handle countdown
  useEffect(() => {
    if (!showCountdown) return

    if (countdown === 0) {
      setShowCountdown(false)
      onVideoEnd?.()
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [showCountdown, countdown, onVideoEnd])

  const handleVideoEnded = () => {
    if (showCountdownOnEnd && onVideoEnd) {
      setShowCountdown(true)
      setCountdown(5)
    } else {
      onVideoEnd?.()
    }
  }

  const handleVideoError = () => {
    setError('Unable to load video. Please try again later.')
    setIsLoading(false)
  }

  const handleVideoLoaded = () => {
    setIsLoading(false)
    setError(null)
  }

  if (!videoUrl) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground',
          className,
        )}
      >
        <p>No video available</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground',
          className,
        )}
      >
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      <video
        ref={videoRef}
        key={videoSource}
        src={videoSource}
        title={title}
        className="aspect-video w-full rounded-lg bg-black"
        controls
        playsInline
        controlsList="nodownload"
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        onLoadedData={handleVideoLoaded}
        onCanPlay={handleVideoLoaded}
      />

      {/* Countdown Overlay */}
      {showCountdown && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-white">Next Lesson In</p>
            <div className="text-6xl font-bold text-accent">{countdown}</div>
            <button
              onClick={handleCancelCountdown}
              className="mt-2 rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
