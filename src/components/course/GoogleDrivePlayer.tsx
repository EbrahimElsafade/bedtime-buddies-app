import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GoogleDrivePlayerProps {
  fileId: string
  title?: string
  className?: string
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  title = 'Video player',
  className,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
    </div>
  )
}

export default GoogleDrivePlayer
