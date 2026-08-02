import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Play, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePreferDrivePopup } from '@/hooks/use-mobile'
import { useIsIOS } from '@/hooks/use-ios-detect'
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getGoogleDriveEmbedUrl,
  getGoogleDriveThumbnailUrl,
  normalizeGoogleDriveFileId,
} from '@/utils/googleDriveVideo'
import './google-drive-embed.css'

interface GoogleDrivePlayerProps {
  fileId: string
  title?: string
  className?: string
  onVideoEnd?: () => void
  showCountdownOnEnd?: boolean
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
}

const DriveIframe: React.FC<{ embedSrc: string; title: string; className?: string }> = ({
  embedSrc,
  title,
  className,
}) => (
  <div className={cn('google-drive-embed-container', className)}>
    <div className="gdrive-toolbar-cover" aria-hidden />
    <iframe
      src={embedSrc}
      title={title}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
    />
  </div>
)

interface DrivePosterProps {
  thumbUrl: string
  onPlay: () => void
  playLabel: string
}

const DrivePoster: React.FC<DrivePosterProps> = ({ thumbUrl, onPlay, playLabel }) => (
  <div className="google-drive-embed-poster">
    <img
      src={thumbUrl}
      alt=""
      className="google-drive-embed-poster__image"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
    <div className="google-drive-embed-poster__scrim">
      <button
        type="button"
        className="google-drive-embed-poster__play"
        onClick={onPlay}
        aria-label={playLabel}
      >
        <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
      </button>
    </div>
  </div>
)

interface DriveVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  embedSrc: string
  closeLabel: string
  isIOS: boolean
  tapToPlayLabel: string
  playLabel: string
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  loadingLabel: string
}

const SWIPE_THRESHOLD = 60
const SWIPE_MAX_HORIZONTAL_RATIO = 0.6 // |dx| must be < 0.6 * |dy|
const SWIPE_MAX_DURATION = 800
const TRANSITION_MS = 550

const DriveVideoDialog: React.FC<DriveVideoDialogProps> = ({
  open,
  onOpenChange,
  title,
  embedSrc,
  closeLabel,
  isIOS,
  tapToPlayLabel,
  playLabel,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  loadingLabel,
}) => {
  // On iOS, autoplay in a cross-origin iframe is blocked. We defer mounting
  // the iframe until the user taps our overlay — the tap becomes the user
  // gesture that allows playback to start.
  const [iosPlayRequested, setIosPlayRequested] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  // Reset iOS overlay whenever the dialog closes or the source changes.
  useEffect(() => {
    if (!open) setIosPlayRequested(false)
  }, [open])

  const prevSrcRef = useRef(embedSrc)
  useEffect(() => {
    if (prevSrcRef.current !== embedSrc) {
      prevSrcRef.current = embedSrc
      if (open) {
        setIosPlayRequested(false)
        setTransitioning(true)
        const t = setTimeout(() => setTransitioning(false), TRANSITION_MS)
        return () => clearTimeout(t)
      }
    }
  }, [embedSrc, open])

  const shouldMountIframe = (!isIOS || iosPlayRequested) && !transitioning
  const showIosOverlay = isIOS && !iosPlayRequested && open && !transitioning

  // Swipe handling — attached to edge strips (iframe swallows its own touches).
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchRef.current
      touchRef.current = null
      if (!start) return
      if (transitioning) return
      const end = e.changedTouches[0]
      if (!end) return
      const dx = end.clientX - start.x
      const dy = end.clientY - start.y
      const dt = Date.now() - start.t
      if (dt > SWIPE_MAX_DURATION) return
      if (Math.abs(dy) < SWIPE_THRESHOLD) return
      if (Math.abs(dx) > Math.abs(dy) * SWIPE_MAX_HORIZONTAL_RATIO) return
      if (dy < 0 && hasNext && onNext) {
        onNext()
      } else if (dy > 0 && hasPrev && onPrev) {
        onPrev()
      }
    },
    [hasNext, hasPrev, onNext, onPrev, transitioning],
  )

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay className="google-drive-dialog-overlay" />
      <DialogPrimitive.Content
        className="google-drive-dialog-content"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="google-drive-embed-dialog">
          <div className="gdrive-toolbar-cover" aria-hidden />
          {open && shouldMountIframe && (
            <iframe
              src={embedSrc}
              title={title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {showIosOverlay && (
            <button
              type="button"
              className="google-drive-ios-tap-overlay"
              onClick={() => setIosPlayRequested(true)}
              aria-label={playLabel}
            >
              <span className="google-drive-ios-tap-overlay__play">
                <Play className="h-10 w-10 fill-current" />
              </span>
              <span className="google-drive-ios-tap-overlay__label">
                {tapToPlayLabel}
              </span>
            </button>
          )}

          {transitioning && (
            <div className="google-drive-loading-overlay" role="status" aria-live="polite">
              <Loader2 className="h-10 w-10 animate-spin" />
              <span className="sr-only">{loadingLabel}</span>
            </div>
          )}

          {/* Edge swipe capture strips — thin, don't cover video controls. */}
          {(hasNext || hasPrev) && (
            <>
              <div
                className="google-drive-swipe-zone google-drive-swipe-zone--left"
                aria-hidden
                {...swipeHandlers}
              />
              <div
                className="google-drive-swipe-zone google-drive-swipe-zone--right"
                aria-hidden
                {...swipeHandlers}
              />
            </>
          )}
        </div>

        <DialogClose className="google-drive-dialog-close" aria-label={closeLabel}>
          <X />
          <span className="sr-only">{closeLabel}</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
  )
}

/**
 * Native Google Drive player.
 * - &lt; 1024px: poster + fullscreen popup
 * - ≥ 1024px: inline iframe on desktop
 */
const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  title = 'Video player',
  className,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  const { t } = useTranslation('courses')
  const preferPopup = usePreferDrivePopup()
  const isIOS = useIsIOS()
  const [dialogOpen, setDialogOpen] = useState(false)
  const normalizedId = normalizeGoogleDriveFileId(fileId)
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (preferPopup && prevIdRef.current && prevIdRef.current !== normalizedId) {
      // User switched to a different lesson — auto-open the player.
      setDialogOpen(true)
    } else if (prevIdRef.current !== normalizedId) {
      setDialogOpen(false)
    }
    prevIdRef.current = normalizedId
  }, [normalizedId, preferPopup])

  if (!normalizedId) {
    return (
      <div
        className={cn(
          'flex aspect-video w-full min-h-[200px] items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <p>No video available</p>
      </div>
    )
  }

  const embedSrc = `${getGoogleDriveEmbedUrl(normalizedId)}?autoplay=1&mute=1`
  const thumbUrl = getGoogleDriveThumbnailUrl(normalizedId)

  if (!preferPopup) {
    return (
      <div className={cn('relative', className)}>
        <DriveIframe embedSrc={embedSrc} title={title} />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <DrivePoster
        thumbUrl={thumbUrl}
        onPlay={() => setDialogOpen(true)}
        playLabel={t('course.watchLesson')}
      />
      <DriveVideoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        embedSrc={embedSrc}
        closeLabel={t('course.closeVideo')}
        isIOS={isIOS}
        tapToPlayLabel={t('course.tapToPlay', 'Tap to start video')}
        playLabel={t('course.watchLesson')}
        onNext={onNext}
        onPrev={onPrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
        loadingLabel={t('course.loadingVideo', 'Loading video')}
      />
    </div>
  )
}

export default GoogleDrivePlayer
