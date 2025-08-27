
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

declare global {
  interface Navigator {
    standalone?: boolean
  }
  
  interface Window {
    MSStream?: any
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
    console.log('PWA Install Prompt: Initializing...')
    
    // Enhanced PWA detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppIOS = navigator.standalone === true
    const isInstallable = !isStandalone && !isInWebAppIOS
    
    console.log('PWA Status:', { 
      isStandalone, 
      isInWebAppIOS, 
      isInstallable,
      userAgent: navigator.userAgent,
      isAndroidChrome: /Android.*Chrome/.test(navigator.userAgent),
      protocol: window.location.protocol,
      hasServiceWorker: 'serviceWorker' in navigator
    })

    if (!isInstallable) {
      console.log('PWA: App is already installed or running in standalone mode')
      setIsInstalled(true)
      return
    }

    // Check dismissal status
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed')
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time')
    const oneMinuteAgo = Date.now() - 1 * 60 * 1000
    
    if (dismissedTime && parseInt(dismissedTime) < oneMinuteAgo) {
      console.log('PWA: Resetting dismissal after 1 minute')
      localStorage.removeItem('pwa-prompt-dismissed')
      localStorage.removeItem('pwa-prompt-dismissed-time')
    }
    
    if (hasPromptBeenDismissed && dismissedTime && parseInt(dismissedTime) > oneMinuteAgo) {
      console.log('PWA: Prompt was recently dismissed')
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired!', e)
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt immediately when event is available
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      setIsInstalling(false)
      localStorage.removeItem('pwa-prompt-dismissed')
      localStorage.removeItem('pwa-prompt-dismissed-time')
    }

    // Listen for install events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For Android Chrome, show prompt after user interaction
    const showPromptAfterDelay = () => {
      console.log('PWA: Checking if we should show prompt...')
      
      // Only show on Android Chrome for now
      if (/Android.*Chrome/.test(navigator.userAgent)) {
        console.log('PWA: Showing prompt for Android Chrome')
        setShowPrompt(true)
      }
    }

    // Wait for user interaction, then show prompt
    const timer = setTimeout(showPromptAfterDelay, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('PWA: Install button clicked')
    console.log('PWA: Deferred prompt available:', !!deferredPrompt)
    
    if (!deferredPrompt) {
      console.log('PWA: No deferred prompt - checking browser and providing instructions')
      
      // Detect Android Chrome specifically
      if (/Android.*Chrome/.test(navigator.userAgent)) {
        console.log('PWA: Android Chrome detected - providing Chrome instructions')
        alert(`To install this app on Android Chrome:

1. Tap the menu (⋮) in the top right corner
2. Look for "Add to Home screen" or "Install app"
3. Tap it and then tap "Add" or "Install"

If you don't see these options, make sure you're using Chrome and the page is loaded over HTTPS.`)
        return
      }
      
      // For other Android browsers
      if (/Android/.test(navigator.userAgent)) {
        alert(`To install this app on Android:

1. Open this page in Chrome browser
2. Tap the menu (⋮) and select "Add to Home screen"
3. Or look for an install prompt at the bottom of the screen`)
        return
      }
      
      // Generic instructions
      alert('To install this app, look for an "Install" button in your browser or check your browser menu for "Add to Home Screen" option.')
      return
    }

    try {
      setIsInstalling(true)
      console.log('PWA: Triggering native install prompt')
      
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: Install prompt outcome:', outcome)

      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
        setShowPrompt(false)
      } else {
        console.log('PWA: User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA: Install prompt failed:', error)
      alert('Installation failed. Please try using your browser menu to install the app.')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    console.log('PWA: Prompt dismissed by user')
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString())
  }

  // Don't show if app is already installed or conditions not met
  if (isInstalled || !showPrompt) {
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
                      {deferredPrompt ? t('pwa.install') : 'Install'}
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
