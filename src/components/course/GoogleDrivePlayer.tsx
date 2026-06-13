import React, { useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePreferDrivePopup } from '@/hooks/use-mobile'
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
}

const DriveVideoDialog: React.FC<DriveVideoDialogProps> = ({
  open,
  onOpenChange,
  title,
  embedSrc,
  closeLabel,
}) => (
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
          {open && (
            <iframe
              src={embedSrc}
              title={title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
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

/**
 * Native Google Drive player.
 * - &lt; 1024px: poster + fullscreen popup
 * - ≥ 1024px: inline iframe on desktop
 */
const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  title = 'Video player',
  className,
}) => {
  const { t } = useTranslation('courses')
  const preferPopup = usePreferDrivePopup()
  const [dialogOpen, setDialogOpen] = useState(false)
  const normalizedId = normalizeGoogleDriveFileId(fileId)

  useEffect(() => {
    setDialogOpen(false)
  }, [normalizedId])

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

  const embedSrc = `${getGoogleDriveEmbedUrl(normalizedId)}?autoplay=1`
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
      />
    </div>
  )
}

export default GoogleDrivePlayer
