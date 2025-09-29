import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share, Copy, Check, X } from 'lucide-react'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
} from 'react-share'
import { useTranslation } from 'react-i18next'

interface ShareDialogProps {
  storyTitle: string
  storyDescription?: string
}

export const ShareDialog = ({
  storyTitle,
  storyDescription,
}: ShareDialogProps) => {
  const { t } = useTranslation('stories')
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = window.location.href
  const shareTitle = `Check out this amazing story: ${storyTitle}`
  const shareDescription =
    storyDescription || 'Discover wonderful bedtime stories on Dolfoon!'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-md shadow"
          aria-label="Share story"
        >
          <Share className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-lg font-semibold">
            Share this story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* URL Input with Copy Button */}
          <div
            dir="ltr"
            className="flex items-center gap-2 rounded-lg bg-muted p-3"
          >
            <input
              className="flex-1 border-none bg-transparent font-mono text-sm text-muted-foreground outline-none"
              value={shareUrl}
              readOnly
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 px-3"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  COPY
                </>
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <TwitterShareButton
              url={shareUrl}
              title={shareTitle}
              hashtags={['bedtimestories', 'stories']}
              className="w-full"
            >
              <div className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1DA1F2]/60 p-4 text-background transition-colors hover:bg-[#1DA1F2]">
                <TwitterIcon size={24} round />
                <span className="font-medium">Twitter</span>
              </div>
            </TwitterShareButton>

            <FacebookShareButton
              url={shareUrl}
              hashtag="#bedtimestories"
              className="w-full"
            >
              <div className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2]/60 p-4 text-background transition-colors hover:bg-[#1877F2]">
                <FacebookIcon size={24} round />
                <span className="font-medium">Facebook</span>
              </div>
            </FacebookShareButton>

            <TelegramShareButton
              url={shareUrl}
              title={shareTitle}
              className="w-full"
            >
              <div className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#0088CC]/60 p-4 text-background transition-colors hover:bg-[#0088CC]">
                <TelegramIcon size={24} round />
                <span className="font-medium">Telegram</span>
              </div>
            </TelegramShareButton>

            <WhatsappShareButton
              url={shareUrl}
              title={shareTitle}
              separator=" - "
              className="w-full"
            >
              <div className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#25D366]/60 p-4 text-background transition-colors hover:bg-[#25D366]">
                <WhatsappIcon size={24} round />
                <span className="font-medium">WhatsApp</span>
              </div>
            </WhatsappShareButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
