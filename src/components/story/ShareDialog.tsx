
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share, Copy, Check } from 'lucide-react'
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

export const ShareDialog = ({ storyTitle, storyDescription }: ShareDialogProps) => {
  const { t } = useTranslation('stories')
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = window.location.href
  const shareTitle = `Check out this amazing story: ${storyTitle}`
  const shareDescription = storyDescription || 'Discover wonderful bedtime stories on Wonder World!'

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
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          aria-label="Share story"
        >
          <Share className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              value={shareUrl}
              readOnly
            />
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <FacebookShareButton
              url={shareUrl}
              hashtag="#bedtimestories"
              className="w-full"
            >
              <div className="flex items-center justify-center space-x-2 p-2 rounded-md border hover:bg-muted transition-colors w-full">
                <FacebookIcon size={20} round />
                <span className="text-sm">Facebook</span>
              </div>
            </FacebookShareButton>

            <TwitterShareButton
              url={shareUrl}
              title={shareTitle}
              hashtags={["bedtimestories", "stories"]}
              className="w-full"
            >
              <div className="flex items-center justify-center space-x-2 p-2 rounded-md border hover:bg-muted transition-colors w-full">
                <TwitterIcon size={20} round />
                <span className="text-sm">Twitter</span>
              </div>
            </TwitterShareButton>

            <WhatsappShareButton
              url={shareUrl}
              title={shareTitle}
              separator=" - "
              className="w-full"
            >
              <div className="flex items-center justify-center space-x-2 p-2 rounded-md border hover:bg-muted transition-colors w-full">
                <WhatsappIcon size={20} round />
                <span className="text-sm">WhatsApp</span>
              </div>
            </WhatsappShareButton>

            <TelegramShareButton
              url={shareUrl}
              title={shareTitle}
              className="w-full"
            >
              <div className="flex items-center justify-center space-x-2 p-2 rounded-md border hover:bg-muted transition-colors w-full">
                <TelegramIcon size={20} round />
                <span className="text-sm">Telegram</span>
              </div>
            </TelegramShareButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
