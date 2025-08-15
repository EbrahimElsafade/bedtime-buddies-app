
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (hasPromptBeenDismissed) {
      return;
    }

    // Check PWA requirements
    const checkPWARequirements = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      
      if (hasServiceWorker && isHTTPS && hasManifest) {
        setCanInstall(true);
        // Show prompt earlier if all requirements are met
        setTimeout(() => {
          if (!deferredPrompt) {
            setShowPrompt(true); // Show even without beforeinstallprompt event
          }
        }, 2000);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      
      // Show our custom prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    // Check requirements immediately
    checkPWARequirements();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (error) {
        // Handle error silently
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Provide manual installation instructions
      const isMobileChrome = /Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
      const isDesktopChrome = /Chrome/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
      
      if (isMobileChrome) {
        alert('To install: Tap the menu (⋮) → "Add to Home screen"');
      } else if (isDesktopChrome) {
        alert('To install: Click the install icon (⊞) in the address bar or menu → "Install Wonder World"');
      } else {
        alert('To install this app, use Chrome browser and look for the install option in the menu.');
      }
      
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Show if not installed and can install or prompt is available
  if (isInstalled || (!showPrompt && !canInstall)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-white/95 dark:bg-nightsky-light/95 backdrop-blur-sm shadow-xl border-dream-light/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-dream-light/20 to-purple-100/50 p-2 rounded-lg">
              <Smartphone className="w-6 h-6 text-dream-DEFAULT" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('common.installApp', 'Install Wonder World')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {t('common.installAppDescription', 'Get quick access to stories, games, and courses right from your home screen!')}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-gradient-to-r from-dream-DEFAULT to-purple-500 hover:from-dream-light hover:to-purple-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.install', 'Install')}
                </Button>
                
                <Button 
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('common.later', 'Later')}
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
