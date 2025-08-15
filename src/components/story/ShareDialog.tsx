
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-lg font-semibold">Share this story</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          {/* URL Input with Copy Button */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md flex-shrink-0">
              <Share className="h-4 w-4 text-primary-foreground" />
            </div>
            <input
              className="flex-1 bg-transparent text-sm font-mono text-muted-foreground border-none outline-none"
              value={shareUrl}
              readOnly
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="px-3 h-8"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
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
              hashtags={["bedtimestories", "stories"]}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[#1DA1F2] hover:bg-[#1a91da] transition-colors w-full text-white">
                <TwitterIcon size={24} round />
                <span className="font-medium">Twitter</span>
              </div>
            </TwitterShareButton>

            <FacebookShareButton
              url={shareUrl}
              hashtag="#bedtimestories"
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] transition-colors w-full text-white">
                <FacebookIcon size={24} round />
                <span className="font-medium">Facebook</span>
              </div>
            </FacebookShareButton>

            <TelegramShareButton
              url={shareUrl}
              title={shareTitle}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[#0088CC] hover:bg-[#007bb8] transition-colors w-full text-white">
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
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[#25D366] hover:bg-[#22c55e] transition-colors w-full text-white">
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
