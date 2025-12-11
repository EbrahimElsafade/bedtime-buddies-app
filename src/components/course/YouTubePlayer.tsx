import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  className?: string
  autoplay?: boolean
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
  onCountdownCancel?: () => void
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = 'YouTube video player',
  className,
  autoplay = false,
  onVideoEnd,
  showCountdownOnEnd = true,
  onCountdownCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const plyrRef = useRef<Plyr | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isPlaying, setIsPlaying] = useState(autoplay)

  const handleCancelCountdown = () => {
    setShowCountdown(false)
    setCountdown(5)
    onCountdownCancel?.()
  }

  const handlePlayClick = () => {
    if (!plyrRef.current) return

    // Toggle playback: pause if playing, otherwise play
    try {
      if (plyrRef.current.playing) {
        plyrRef.current.pause()
      } else {
        plyrRef.current.play()
      }
    } catch (e) {
      // Fallback: try calling play()
      plyrRef.current.play()
    }
  }

  useEffect(() => {
    if (!containerRef.current || !videoId) return

    // Destroy existing player instance
    if (plyrRef.current) {
      plyrRef.current.destroy()
      plyrRef.current = null
    }

    // Clear container content
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Create new container div for the player
    const playerContainer = document.createElement('div')
    playerContainer.setAttribute('data-plyr-provider', 'youtube')
    playerContainer.setAttribute('data-plyr-embed-id', videoId)
    containerRef.current.appendChild(playerContainer)

    // Initialize Plyr with YouTube video
    plyrRef.current = new Plyr(playerContainer, {
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
        'speed',
      ],
      settings: ['quality', 'speed', 'loop'],
      quality: { default: 720, options: [720, 1080] },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      autoplay: autoplay,
      title: title,
      youtube: {
        noCookie: true,
        controls: 0,
      },
    })

    // Add event listener for video end
    const handleVideoEnded = () => {
      if (showCountdownOnEnd) {
        setShowCountdown(true)
        setCountdown(5)
      } else {
        onVideoEnd?.()
      }
    }

    const handlePlayStateChange = () => {
      setIsPlaying(plyrRef.current?.playing ?? false)
    }

    plyrRef.current.on('ended', handleVideoEnded)
    plyrRef.current.on('play', handlePlayStateChange)
    plyrRef.current.on('pause', handlePlayStateChange)

    return () => {
      if (plyrRef.current) {
        plyrRef.current.off('ended', handleVideoEnded)
        plyrRef.current.off('play', handlePlayStateChange)
        plyrRef.current.off('pause', handlePlayStateChange)
        plyrRef.current.destroy()
        plyrRef.current = null
      }
    }
  }, [videoId, autoplay, title, showCountdownOnEnd, onVideoEnd])

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

  if (!videoId) {
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
      <div
        ref={containerRef}
        className={cn('player relative cursor-pointer')}
        onClick={handlePlayClick}
      />

      {/* Play Button Overlay - shows when paused */}
      {!isPlaying && !showCountdown && (
        <div
          onClick={handlePlayClick}
          role="button"
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <div className="flex h-24 w-24 transform items-center justify-center rounded-full bg-accent/90 shadow-lg transition-transform hover:scale-110 hover:bg-accent">
            <svg
              className="ml-1 h-12 w-12 text-secondary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
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

export default YouTubePlayer
