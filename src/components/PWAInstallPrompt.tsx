
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

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = navigator.standalone === true

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
    setPlatform(isMobile ? 'mobile' : 'desktop')

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (hasPromptBeenDismissed) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt triggered')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt immediately when we have a native prompt
      setShowPrompt(true)
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

    // For platforms that don't fire beforeinstallprompt, show prompt after delay
    const showPromptTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        // Only show for mobile platforms that might support add to homescreen
        if (isMobile) {
          setShowPrompt(true)
        }
      }
    }, 5000)

    return () => {
      clearTimeout(showPromptTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true)
        console.log('Triggering native install prompt')
        
        // Show the native install prompt
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
        handleDismiss()
      }

      setDeferredPrompt(null)
    } else {
      // For iOS Safari, try to trigger add to homescreen
      if (platform === 'mobile' && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        // Create a custom event to potentially trigger iOS add to homescreen
        try {
          const event = new CustomEvent('addtohomescreen')
          window.dispatchEvent(event)
        } catch (error) {
          console.log('iOS add to homescreen not available')
        }
      }
      
      // Dismiss the prompt since we can't install
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if app is already installed or no prompt available
  if (isInstalled || !showPrompt) {
    return null
  }

  // Only show if we have a native prompt available or on mobile
  if (!deferredPrompt && platform === 'desktop') {
    return null
  }

  const getInstallMessage = () => {
    if (platform === 'mobile') {
      return 'Install Wonder World App for the best experience!'
    } else {
      return 'Install Wonder World App on your desktop!'
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
                      Install Now
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
