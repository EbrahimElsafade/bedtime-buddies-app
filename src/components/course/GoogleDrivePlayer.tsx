import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GoogleDrivePlayerProps {
  fileId: string
  title?: string
  className?: string
  autoplay?: boolean
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
  onCountdownCancel?: () => void
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  title = 'Video player',
  className,
  autoplay = false,
  onVideoEnd,
  showCountdownOnEnd = true,
  onCountdownCancel,
}) => {
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [hasEnded, setHasEnded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleCancelCountdown = () => {
    setShowCountdown(false)
    setCountdown(5)
    onCountdownCancel?.()
  }

  // Reset state when fileId changes
  useEffect(() => {
    setShowCountdown(false)
    setCountdown(5)
    setHasEnded(false)
  }, [fileId])

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

  // Mark video as ended (manual trigger since iframe doesn't expose events)
  const handleMarkAsEnded = () => {
    if (hasEnded) return
    setHasEnded(true)
    if (showCountdownOnEnd) {
      setShowCountdown(true)
      setCountdown(5)
    } else {
      onVideoEnd?.()
    }
  }

  if (!fileId) {
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

  // Google Drive embed URL
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

  return (
    <div className={cn('relative', className)}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="aspect-video w-full rounded-lg"
        allow="autoplay; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />

      {/* Next Lesson Button - shown since we can't detect video end in iframe */}
      {onVideoEnd && !showCountdown && (
        <button
          onClick={handleMarkAsEnded}
          className="absolute bottom-4 right-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          Next Lesson →
        </button>
      )}

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

export default GoogleDrivePlayer
