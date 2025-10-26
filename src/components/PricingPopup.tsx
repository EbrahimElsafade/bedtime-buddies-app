
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const PricingPopup = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('misc');
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    let mounted = true;

    const checkPopupVisibility = () => {
      const hasSeenPopup = localStorage.getItem("pricingPopupSeen");
      const lastSeen = hasSeenPopup ? new Date(hasSeenPopup) : null;
      const showAgain = !lastSeen || (new Date().getTime() - lastSeen.getTime() > 24 * 60 * 60 * 1000);
      
      if (!isAuthenticated && showAgain && mounted) {
        const timer = setTimeout(() => {
          if (mounted) {
            setIsOpen(true);
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    };

    const cleanup = checkPopupVisibility();
    
    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [isAuthenticated]);
  
  const closePopup = () => {
    setIsOpen(false);
    // Set popup as seen for next 24 hours
    localStorage.setItem("pricingPopupSeen", new Date().toISOString());
  };
  
  if (!isOpen || isAuthenticated) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-secondary w-full max-w-md rounded-xl shadow-xl overflow-hidden relative transform transition-all">
        <button 
          onClick={closePopup}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/80"
        >
          <X className="h-5 w-5 text-primary" />
        </button>
        
        <div className="bg-primary-foreground p-6 text-secondary">
          <h3 className="text-xl font-bubbly mb-2">✨ {t('popup.special')}</h3>
          <p className="text-sm opacity-90">
            {t('popup.limitedTime')}
          </p>
        </div>
        
        <div className="p-6">
          <h4 className="text-lg font-medium text-primary mb-4">
            {t('popup.unlock')}
          </h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
               <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center">
                 <span className="text-xs text-primary">✓</span>
               </div>
               <p className="ml-3 text-sm text-primary">
                 {t('popup.feature1')}
               </p>
             </div>
             <div className="flex items-start">
               <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center">
                 <span className="text-xs text-primary">✓</span>
               </div>
               <p className="ml-3 text-sm text-primary">
                 {t('popup.feature2')}
               </p>
             </div>
             <div className="flex items-start">
               <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center">
                 <span className="text-xs text-primary">✓</span>
               </div>
               <p className="ml-3 text-sm text-primary">
                 {t('popup.feature3')}
               </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
             <div>
               <p className="text-xs text-primary/70 line-through">
                 $9.99 / {t('popup.month')}
               </p>
               <p className="text-2xl font-bubbly text-primary">
                 $4.99 <span className="text-sm font-normal">/ {t('popup.month')}</span>
               </p>
             </div>
             <div className="bg-primary/30 text-primary px-3 py-1 rounded-full text-xs font-medium">
               50% {t('popup.off')}
             </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link to="/subscription" className="w-full">
               <Button className="w-full bg-primary-foreground hover:bg-primary text-secondary">
                 {t('popup.subscribe')}
               </Button>
             </Link>
             <Button 
               variant="ghost" 
               onClick={closePopup} 
               className="w-full text-primary hover:text-primary-foreground"
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
