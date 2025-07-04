
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const PricingPopup = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is not logged in and hasn't dismissed the popup recently
    const hasSeenPopup = localStorage.getItem("pricingPopupSeen");
    const lastSeen = hasSeenPopup ? new Date(hasSeenPopup) : null;
    const showAgain = !lastSeen || (new Date().getTime() - lastSeen.getTime() > 24 * 60 * 60 * 1000); // 24 hours
    
    if (!isAuthenticated && showAgain) {
      // Show popup immediately for testing, later can revert to 2 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 100); // Reduced from 2000ms to 100ms for faster testing
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
  
  const closePopup = () => {
    setIsOpen(false);
    // Set popup as seen for next 24 hours
    localStorage.setItem("pricingPopupSeen", new Date().toISOString());
  };
  
  if (!isOpen || isAuthenticated) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-nightsky-light w-full max-w-md rounded-xl shadow-xl overflow-hidden relative transform transition-all">
        <button 
          onClick={closePopup}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/80"
        >
          <X className="h-5 w-5 text-dream-DEFAULT" />
        </button>
        
        <div className="bg-dream-DEFAULT p-6 text-white">
          <h3 className="text-xl font-bubbly mb-2">✨ {t('popup.special')}</h3>
          <p className="text-sm opacity-90">
            {t('popup.limitedTime')}
          </p>
        </div>
        
        <div className="p-6">
          <h4 className="text-lg font-medium text-dream-DEFAULT mb-4">
            {t('popup.unlock')}
          </h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-dream-light/30 flex items-center justify-center">
                <span className="text-xs text-dream-DEFAULT">✓</span>
              </div>
              <p className="ml-3 text-sm text-dream-DEFAULT dark:text-muted-foreground">
                {t('popup.feature1')}
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-dream-light/30 flex items-center justify-center">
                <span className="text-xs text-dream-DEFAULT">✓</span>
              </div>
              <p className="ml-3 text-sm text-dream-DEFAULT dark:text-muted-foreground">
                {t('popup.feature2')}
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-dream-light/30 flex items-center justify-center">
                <span className="text-xs text-dream-DEFAULT">✓</span>
              </div>
              <p className="ml-3 text-sm text-dream-DEFAULT dark:text-muted-foreground">
                {t('popup.feature3')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-dream-DEFAULT/70 dark:text-muted-foreground line-through">
                $9.99 / {t('popup.month')}
              </p>
              <p className="text-2xl font-bubbly text-dream-DEFAULT">
                $4.99 <span className="text-sm font-normal">/ {t('popup.month')}</span>
              </p>
            </div>
            <div className="bg-dream-light/30 text-dream-DEFAULT px-3 py-1 rounded-full text-xs font-medium">
              50% {t('popup.off')}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link to="/subscription" className="w-full">
              <Button className="w-full bg-dream-DEFAULT hover:bg-dream-dark text-white">
                {t('popup.subscribe')}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={closePopup} 
              className="w-full text-dream-DEFAULT hover:text-dream-dark"
            >
              {t('popup.later')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPopup;
