
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('desktop')
  const [isiOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppIOS = navigator.standalone === true

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
    const iOS = /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent)
    setPlatform(isMobile ? 'mobile' : 'desktop')
    setIsIOS(iOS)

    if (isStandalone || isInWebAppIOS) {
      setIsInstalled(true)
      return
    }

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (hasPromptBeenDismissed) {
      return
    }

    // Show prompt for desktop browsers even without beforeinstallprompt
    if (!isMobile) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt triggered')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    }

    const handleAppInstalled = () => {
      console.log('App installed successfully')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      setIsInstalling(false)
      localStorage.removeItem('pwa-prompt-dismissed')
    }

    // iOS Safari does not fire beforeinstallprompt; show instructions UI
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
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
      console.log('No deferred prompt available')
      return
    }

    try {
      setIsInstalling(true)
      console.log('Triggering install prompt')
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('Install prompt outcome:', outcome)

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
        setIsInstalling(false)
        handleDismiss()
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
      setIsInstalling(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if app is already installed
  if (isInstalled || !showPrompt) {
    return null
  }

  // For mobile, require deferredPrompt except on iOS (instructions only). For desktop, show instructions.
  if (platform === 'mobile' && !deferredPrompt && !isiOS) {
    return null
  }

  return (
    <div className="fixed md:bottom-4 bottom-[4.5rem] start-4 end-4 z-50 md:start-auto md:end-4 md:max-w-sm">
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
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="inline-flex items-center rounded-md hover:text-white dark:text-white bg-gradient-to-r from-dream-DEFAULT to-purple-500 px-3 py-2 text-sm font-medium text-black hover:from-dream-light hover:to-purple-600 disabled:opacity-50"
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
                </button>

                <button
                  onClick={handleDismiss}
                  disabled={isInstalling}
                  className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('pwa.later')}
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              disabled={isInstalling}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
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
