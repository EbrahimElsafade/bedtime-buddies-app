import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import dolphoonLogo from '@/assets/dolphoon-logo.png'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  className?: string
  autoplay?: boolean
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = 'YouTube video player',
  className,
  autoplay = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const plyrRef = useRef<Plyr | null>(null)

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

    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy()
        plyrRef.current = null
      }
    }
  }, [videoId, autoplay, title])

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
    <div
      ref={containerRef}
      className={cn('player', className)}
    />
  )
}

export default YouTubePlayer
