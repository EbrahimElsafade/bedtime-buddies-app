import React, { useRef } from 'react'
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
          'flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <p>No video available</p>
      </div>
    )
  }

  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-black',
        // Use padding-top hack to guarantee 16:9 across all browsers (incl. iOS Safari)
        'aspect-video',
        className,
      )}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default GoogleDrivePlayer
