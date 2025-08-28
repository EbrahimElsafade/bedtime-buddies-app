import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Plus, Home, Share } from 'lucide-react'
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
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /ipad|iphone|ipod/.test(userAgent)
    const isSafari =
      /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSWebApp = navigator.standalone === true
    const isAndroid = /android/.test(userAgent)
    const isChrome = /chrome/.test(userAgent)

    return {
      isIOS,
      isSafari,
      isStandalone,
      isIOSWebApp,
      isAndroid,
      isChrome,
      canInstallNatively:
        (!isIOS && 'serviceWorker' in navigator) || (isAndroid && isChrome),
    }
  }

  const deviceInfo = getDeviceInfo()

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppIOS = navigator.standalone === true

    if (deviceInfo.isStandalone || deviceInfo.isIOSWebApp) {
      setIsInstalled(true)
      return
    }
    const dismissalKey = deviceInfo.isIOS
      ? 'pwa-prompt-dismissed-ios'
      : 'pwa-prompt-dismissed'
    const dismissed = localStorage.getItem(dismissalKey)
    const dismissedTime = localStorage.getItem(`${dismissalKey}-time`)

    if (dismissed && dismissedTime) {
      // iOS: 7 days, Others: 1 day
      const cooldownPeriod = deviceInfo.isIOS
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000
      const cooldownEnd = parseInt(dismissedTime) + cooldownPeriod

      if (Date.now() < cooldownEnd) {
        return
      }
    }

    // For iOS Safari, show instructions after delay
    if (deviceInfo.isIOS && deviceInfo.isSafari && !deviceInfo.isIOSWebApp) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000) // Longer delay for iOS

      return () => clearTimeout(timer)
    }

    // For other platforms, handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setShowIOSInstructions(false)
      setDeferredPrompt(null)
      // Clear all dismissal records
      localStorage.removeItem('pwa-prompt-dismissed')
      localStorage.removeItem('pwa-prompt-dismissed-time')
      localStorage.removeItem('pwa-prompt-dismissed-ios')
      localStorage.removeItem('pwa-prompt-dismissed-ios-time')
    }

    if (deviceInfo.canInstallNatively) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        )
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    // DIFFERENT ACTIONS based on device, but same popup
    if (deviceInfo.isIOS) {
      // iOS: Show instructions modal
      setShowIOSInstructions(true)
      return
    }

    // Non-iOS: Try native install
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
    setShowIOSInstructions(false)

    const dismissalKey = deviceInfo.isIOS
      ? 'pwa-prompt-dismissed-ios'
      : 'pwa-prompt-dismissed'
    localStorage.setItem(dismissalKey, 'true')
    localStorage.setItem(`${dismissalKey}-time`, Date.now().toString())
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if not supported and not iOS
  if (!deviceInfo.isIOS && !deferredPrompt && !showPrompt) {
    return null
  }

  if (!showPrompt) {
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

              {showIOSInstructions ? (
                <>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                    {deviceInfo.isIOS
                      ? t('pwa.installAppDescriptionIOS')
                      : t('pwa.installAppDescription')}
                  </p>

                  {deviceInfo.isIOS && (
                    <div className="mb-3 rounded bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {t('pwa.iosHint')}
                    </div>
                  )}

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
                          {deviceInfo.isIOS ? (
                            <Share className="mr-2 h-4 w-4" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          {deviceInfo.isIOS
                            ? t('pwa.showInstructions')
                            : t('pwa.install')}
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
                </>
              ) : (
                // Inline iOS Instructions
                <div className="mt-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('pwa.iso.installInstructions')}
                    </h4>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                        1
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('pwa.iso.step1')}
                      </span>
                      <Share className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                      <span className="text-sm font-bold text-green-600 dark:text-green-300">
                        2
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('pwa.iso.step2')}
                      </span>
                      <div className="flex items-center gap-1 rounded border bg-white px-2 py-1 dark:bg-gray-800">
                        <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <Home className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
                        3
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('pwa.iso.step3')}
                    </span>
                  </div>

                  <Button onClick={handleDismiss} className="w-full">
                    {t('pwa.iso.gotIt')}
                  </Button>
                </div>
              )}
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

  // // iOS Instructions Modal (separate from main popup)
  // if (showIOSInstructions) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  //       <Card className="w-full max-w-md bg-white dark:bg-gray-900">
  //         <CardContent className="p-6">
  //           <div className="mb-4 flex items-center justify-between">
  //             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  //               {t('pwa.iso.installInstructions')}
  //             </h3>
  //             <Button
  //               onClick={handleDismiss}
  //               variant="ghost"
  //               size="sm"
  //               className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
  //             >
  //               <X className="h-4 w-4" />
  //             </Button>
  //           </div>

  //           <div className="space-y-4">
  //             <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
  //               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
  //                 <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
  //                   1
  //                 </span>
  //               </div>
  //               <div className="flex items-center gap-2">
  //                 <span className="text-sm text-gray-700 dark:text-gray-300">
  //                   {t('pwa.iso.step1')}
  //                 </span>
  //                 <Share className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  //               </div>
  //             </div>

  //             <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
  //               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
  //                 <span className="text-sm font-bold text-green-600 dark:text-green-300">
  //                   2
  //                 </span>
  //               </div>
  //               <div className="flex items-center gap-2">
  //                 <span className="text-sm text-gray-700 dark:text-gray-300">
  //                   {t('pwa.iso.step2')}
  //                 </span>
  //                 <div className="flex items-center gap-1 rounded border bg-white px-2 py-1 dark:bg-gray-800">
  //                   <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
  //                   <Home className="h-4 w-4 text-gray-600 dark:text-gray-400" />
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
  //               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
  //                 <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
  //                   3
  //                 </span>
  //               </div>
  //               <span className="text-sm text-gray-700 dark:text-gray-300">
  //                 {t('pwa.iso.step3')}
  //               </span>
  //             </div>
  //           </div>

  //           <div className="mt-6 flex gap-2">
  //             <Button onClick={handleDismiss} className="flex-1">
  //               {t('pwa.iso.gotIt')}
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  // // Main install prompt
  // return (
  //   <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
  //     <Card className="border-primary/20 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95">
  //       <CardContent className="p-4">
  //         <div className="flex items-start gap-3">
  //           <div className="rounded-lg bg-gradient-to-br from-primary/20 to-purple-100/50 p-2 dark:from-primary/30 dark:to-purple-900/30">
  //             <Smartphone className="h-6 w-6 text-primary" />
  //           </div>

  //           <div className="flex-1">
  //             <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
  //               {t('pwa.installApp')}
  //             </h3>
  //             <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
  //               {deviceInfo.isIOS
  //                 ? t('pwa.installAppDescriptionIOS')
  //                 : t('pwa.installAppDescription')}
  //             </p>

  //             {deviceInfo.isIOS && (
  //               <div className="mb-3 rounded bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
  //                 {t('pwa.iosHint')}
  //               </div>
  //             )}

  //             <div className="flex gap-2">
  //               <Button
  //                 onClick={handleInstallClick}
  //                 disabled={isInstalling}
  //                 size="sm"
  //                 className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600"
  //               >
  //                 {isInstalling ? (
  //                   <>
  //                     <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  //                     {t('loading')}
  //                   </>
  //                 ) : (
  //                   <>
  //                     {deviceInfo.isIOS ? (
  //                       <Share className="mr-2 h-4 w-4" />
  //                     ) : (
  //                       <Download className="mr-2 h-4 w-4" />
  //                     )}
  //                     {deviceInfo.isIOS
  //                       ? t('pwa.showInstructions')
  //                       : t('pwa.install')}
  //                   </>
  //                 )}
  //               </Button>

  //               <Button
  //                 onClick={handleDismiss}
  //                 disabled={isInstalling}
  //                 variant="ghost"
  //                 size="sm"
  //                 className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
  //               >
  //                 {t('pwa.later')}
  //               </Button>
  //             </div>
  //           </div>

  //           <Button
  //             onClick={handleDismiss}
  //             disabled={isInstalling}
  //             variant="ghost"
  //             size="sm"
  //             className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
  //           >
  //             <X className="h-4 w-4" />
  //           </Button>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
}

export default PWAInstallPrompt
