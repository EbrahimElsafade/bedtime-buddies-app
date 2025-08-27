
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
    
    // Check if app is already installed
    const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent)
    const hasServiceWorker = 'serviceWorker' in navigator
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost'
    
    console.log('PWA Status:', { 
      isStandalone, 
      isInWebAppIOS, 
      isInstallable,
      userAgent: navigator.userAgent,
      isAndroidChrome,
      hasServiceWorker,
      isHTTPS,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    })

    if (!isInstallable) {
      console.log('PWA: App is already installed or running in standalone mode')
      setIsInstalled(true)
      return
    }

    // Only proceed if basic PWA requirements are met
    if (!hasServiceWorker || !isHTTPS) {
      console.log('PWA: Basic requirements not met', { hasServiceWorker, isHTTPS })
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

    // For Android Chrome, show prompt after delay if conditions are met
    if (isAndroidChrome) {
      const showPromptAfterDelay = () => {
        console.log('PWA: Android Chrome - showing prompt after delay')
        setShowPrompt(true)
      }
      const timer = setTimeout(showPromptAfterDelay, 2000)
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
        clearTimeout(timer)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('PWA: Install button clicked')
    console.log('PWA: Deferred prompt available:', !!deferredPrompt)
    
    setIsInstalling(true)

    try {
      if (deferredPrompt) {
        console.log('PWA: Triggering native install prompt')
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log('PWA: Install prompt outcome:', outcome)

        if (outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt')
          setShowPrompt(false)
          setIsInstalled(true)
        } else {
          console.log('PWA: User dismissed the install prompt')
        }
        
        setDeferredPrompt(null)
      } else {
        console.log('PWA: No deferred prompt available')
        
        // Check if we're on Android Chrome
        const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent)
        
        if (isAndroidChrome) {
          console.log('PWA: Android Chrome detected - showing manual instructions')
          
          // Create a more user-friendly dialog
          const installText = `To install Wonder World on your device:

1. Tap the menu button (⋮) in your browser
2. Look for "Add to Home screen" or "Install app"
3. Tap it and follow the prompts

If you don't see this option, the app might already be installed or your browser doesn't support PWA installation.`

          alert(installText)
        } else {
          console.log('PWA: Non-Android Chrome browser')
          alert('To install this app, look for "Add to Home Screen" or "Install" in your browser menu.')
        }
      }
    } catch (error) {
      console.error('PWA: Install error:', error)
      
      // More specific error handling
      const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent)
      
      if (isAndroidChrome) {
        alert(`Installation not available automatically. Please use Chrome's menu (⋮) → "Add to Home screen" to install the app.`)
      } else {
        alert('Installation failed. Please use your browser menu to install the app.')
      }
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
                      {deferredPrompt ? t('pwa.install') : 'Install Guide'}
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
