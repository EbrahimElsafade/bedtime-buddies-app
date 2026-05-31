import React from 'react'
import { Maximize2, Play, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
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
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

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
  const autoplayUrl = `${embedUrl}?autoplay=1`
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'group relative flex aspect-[16/18] w-full items-center justify-center overflow-hidden bg-black text-white',
            className,
          )}
          aria-label={title}
        >
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={event => {
              event.currentTarget.style.display = 'none'
            }}
          />
          <span className="absolute inset-0 bg-black/15" aria-hidden="true" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary-foreground shadow-lg transition-transform group-active:scale-95">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
          <span className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center bg-black/70 text-white">
            <Maximize2 className="h-5 w-5" />
          </span>
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute end-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-3xl overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={autoplayUrl}
                title={title}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden bg-black',
        className,
      )}
    >
      <iframe
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
