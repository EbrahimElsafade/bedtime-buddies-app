
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Smartphone, Info } from 'lucide-react'
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
  const [showManualInstructions, setShowManualInstructions] = useState(false)

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

      console.log('PWA Requirements:', { hasServiceWorker, isHTTPS, hasManifest })

      if (hasServiceWorker && isHTTPS && hasManifest) {
        setCanInstall(true)
        // Show prompt after a delay
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt triggered')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      console.log('App installed')
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
        console.log('Triggering install prompt')
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log('Install prompt outcome:', outcome)

        if (outcome === 'accepted') {
          setIsInstalled(true)
        }
      } catch (error) {
        console.error('Install prompt failed:', error)
        setShowManualInstructions(true)
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } else {
      // Show manual installation instructions
      setShowManualInstructions(true)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  const getManualInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
    const isChrome = /chrome/.test(userAgent)

    if (isIOS) {
      return {
        title: 'Install on iOS',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      }
    } else if (isAndroid && isChrome) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the menu button (three dots)',
          'Tap "Add to Home screen" or "Install app"',
          'Tap "Add" or "Install" to confirm'
        ]
      }
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Look for an install icon in your browser\'s address bar',
          'Or go to browser menu and look for "Install Wonder World"',
          'Click to install the app'
        ]
      }
    }
  }

  // Don't show if app is already installed
  if (isInstalled) {
    return null
  }

  // Show manual instructions
  if (showManualInstructions) {
    const instructions = getManualInstructions()
    return (
      <div className="fixed md:bottom-4 bottom-[4.5rem] start-4 end-4 z-50 md:start-auto md:end-4 md:max-w-sm">
        <Card className="border-dream-light/30 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-nightsky-light/95">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gradient-to-br from-dream-light/20 to-purple-100/50 p-2">
                <Info className="text-dream-DEFAULT h-6 w-6" />
              </div>

              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  {instructions.title}
                </h3>
                <ol className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-dream-DEFAULT/20 text-xs font-medium text-dream-DEFAULT">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>

                <Button
                  onClick={() => setShowManualInstructions(false)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Got it
                </Button>
              </div>

              <button
                onClick={() => setShowManualInstructions(false)}
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

  // Show main install prompt
  if (!showPrompt && !canInstall) {
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
                Install Wonder World App
              </h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                Install our app for the best experience on your device!
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="from-dream-DEFAULT bg-gradient-to-r to-purple-500 text-white hover:from-dream-light hover:to-purple-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Later
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
