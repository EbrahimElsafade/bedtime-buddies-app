
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  const [browserType, setBrowserType] = useState<'chrome' | 'safari' | 'firefox' | 'other'>('other')

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = navigator.standalone === true

    // Detect platform and browser
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
    setPlatform(isMobile ? 'mobile' : 'desktop')

    // Detect browser type
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      setBrowserType('chrome')
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      setBrowserType('safari')
    } else if (userAgent.includes('firefox')) {
      setBrowserType('firefox')
    } else {
      setBrowserType('other')
    }

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (hasPromptBeenDismissed) {
      return
    }

    // Show prompt for all platforms after a delay
    const showPromptTimer = setTimeout(() => {
      setShowPrompt(true)
    }, 3000)

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt triggered')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Clear the timer since we have a native prompt
      clearTimeout(showPromptTimer)
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      clearTimeout(showPromptTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true)
        console.log('Triggering install prompt')
        
        // Show the install prompt
        await deferredPrompt.prompt()
        
        // Wait for the user's choice
        const { outcome } = await deferredPrompt.userChoice
        console.log('Install prompt outcome:', outcome)

        if (outcome === 'accepted') {
          console.log('User accepted the install prompt')
          // The 'appinstalled' event will handle the rest
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
    } else {
      // Show manual installation instructions
      showManualInstallInstructions()
    }
  }

  const showManualInstallInstructions = () => {
    let instructions = ''
    
    if (platform === 'mobile') {
      if (browserType === 'safari') {
        instructions = 'Tap the share button and select "Add to Home Screen"'
      } else if (browserType === 'chrome') {
        instructions = 'Tap the menu (⋮) and select "Add to Home screen"'
      } else {
        instructions = 'Look for "Add to Home Screen" option in your browser menu'
      }
    } else {
      if (browserType === 'chrome') {
        instructions = 'Click the install button in the address bar or go to Settings > More tools > Create shortcut'
      } else if (browserType === 'firefox') {
        instructions = 'Click the home icon in the address bar or bookmark this page'
      } else if (browserType === 'safari') {
        instructions = 'Click File > Add to Dock or bookmark this page'
      } else {
        instructions = 'Bookmark this page or look for install options in your browser menu'
      }
    }

    alert(`To install Wonder World App:\n\n${instructions}`)
    handleDismiss()
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if app is already installed
  if (isInstalled || !showPrompt) {
    return null
  }

  const getInstallMessage = () => {
    if (platform === 'mobile') {
      return 'Get instant access and offline features on your device!'
    } else {
      return 'Install this app on your desktop for a better experience!'
    }
  }

  const getInstallButtonText = () => {
    if (deferredPrompt) {
      return platform === 'desktop' ? 'Install App' : 'Install Now'
    } else {
      return 'Show Instructions'
    }
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
                {getInstallMessage()}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  size="sm"
                  className="from-dream-DEFAULT bg-gradient-to-r to-purple-500 text-white hover:from-dream-light hover:to-purple-600 disabled:opacity-50"
                >
                  {isInstalling ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      {getInstallButtonText()}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  disabled={isInstalling}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Later
                </Button>
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
