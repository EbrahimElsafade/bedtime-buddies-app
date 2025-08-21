import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(true) // Always show for UI editing
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(true) // Always allow for UI editing

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (hasPromptBeenDismissed) {
      return
    }

    // Check PWA requirements
    const checkPWARequirements = () => {
      const hasServiceWorker = 'serviceWorker' in navigator
      const isHTTPS =
        location.protocol === 'https:' || location.hostname === 'localhost'
      const hasManifest =
        document.querySelector('link[rel="manifest"]') !== null

      if (hasServiceWorker && isHTTPS && hasManifest) {
        setCanInstall(true)
        // Show prompt after a delay if requirements are met
        setTimeout(() => {
          setShowPrompt(true)
        }, 2000)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)

      // Show our custom prompt immediately when browser allows it
      setTimeout(() => {
        setShowPrompt(true)
      }, 500)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-prompt-dismissed')
    }

    // Check requirements immediately
    checkPWARequirements()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Automatically trigger the browser's install prompt
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          setIsInstalled(true)
        }
      } catch (error) {
        console.log('Install prompt failed')
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } else {
      // For browsers that don't support the install prompt
      setShowPrompt(false)
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-4 start-4 end-4 z-50 md:start-auto md:end-4 md:max-w-sm">
      <Card className="border-dream-light/30 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-nightsky-light/95">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-dream-light/20 to-purple-100/50 p-2">
              <Smartphone className="text-dream-DEFAULT h-6 w-6" />
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
                  size="sm"
                  className="from-dream-DEFAULT bg-gradient-to-r to-purple-500 text-white hover:from-dream-light hover:to-purple-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('pwa.install')}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('pwa.later')}
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt
