
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
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()))
    }
    checkMobile()

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
        }, 3000)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)

      // Show our custom prompt immediately when browser allows it
      setTimeout(() => {
        setShowPrompt(true)
      }, 1000)
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
    } else if (isMobile) {
      // For mobile browsers that don't support the install prompt, show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      let instructions = ''
      if (isIOS) {
        instructions = 'To install: Tap the Share button and select "Add to Home Screen"'
      } else if (isAndroid) {
        instructions = 'To install: Tap the menu (⋮) and select "Add to Home screen" or "Install app"'
      } else {
        instructions = 'To install: Use your browser menu to add this app to your home screen'
      }
      
      alert(instructions)
      setShowPrompt(false)
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    } else {
      // For desktop browsers that don't support the install prompt
      setShowPrompt(false)
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Show if not installed, can install, and prompt should be shown
  if (isInstalled || !canInstall || !showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm sm:inset-x-auto sm:right-4 sm:left-auto">
      <Card className="border-dream-light/30 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-nightsky-light/95">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-dream-light/20 to-purple-100/50 p-1.5 sm:p-2">
              <Smartphone className="h-5 w-5 text-dream-DEFAULT sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                {t('pwa.installApp')}
              </h3>
              <p className="mb-2 text-xs text-gray-600 dark:text-gray-300 sm:mb-3 sm:text-sm">
                {t('pwa.installAppDescription')}
              </p>

              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="h-8 bg-gradient-to-r from-dream-DEFAULT to-purple-500 text-xs text-white hover:from-dream-light hover:to-purple-600 sm:h-9 sm:text-sm"
                >
                  <Download className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  {t('pwa.install')}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 sm:h-9 sm:text-sm"
                >
                  {t('pwa.later')}
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 sm:p-1"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt
