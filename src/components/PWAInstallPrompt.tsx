import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const PWAInstallPrompt = () => {
  const { t } = useTranslation('common')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppIOS = navigator.standalone === true
    
    if (isStandalone || isInWebAppIOS) {
      setIsInstalled(true)
      return
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time')
    
    if (dismissed && dismissedTime) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (parseInt(dismissedTime) > oneDayAgo) {
        return // Don't show again for 24 hours
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-prompt-dismissed')
      localStorage.removeItem('pwa-prompt-dismissed-time')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowPrompt(false)
      return
    }

    try {
      setIsInstalling(true)
      
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install prompt failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString())
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary/20 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-purple-100/50 p-2 dark:from-primary/30 dark:to-purple-900/30">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                {t('pwa.installApp')}
              </h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                {t('pwa.installAppDescription')}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600"
                >
                  {isInstalling ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      {t('pwa.install')}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDismiss}
                  disabled={isInstalling}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('pwa.later')}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              disabled={isInstalling}
              variant="ghost"
              size="sm"
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt