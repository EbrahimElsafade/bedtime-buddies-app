import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl: string
  title?: string
  className?: string
  autoplay?: boolean
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
  onCountdownCancel?: () => void
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

  const handleCancelCountdown = () => {
    setShowCountdown(false)
    setCountdown(5)
    onCountdownCancel?.()
  }

  // Reset state when videoUrl changes
  useEffect(() => {
    setShowCountdown(false)
    setCountdown(5)
  }, [videoUrl])

  // Handle autoplay when video changes
  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [videoUrl, autoplay])

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

  return (
    <div className={cn('relative', className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        title={title}
        className="aspect-video w-full rounded-lg bg-black"
        controls
        playsInline
        onEnded={handleVideoEnded}
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
