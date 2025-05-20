
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PricingPopup from "@/components/PricingPopup";
import Hero from "@/components/home/Hero";
import FreeStory from "@/components/home/FreeStory";
import FeaturedStories from "@/components/home/FeaturedStories";
import Features from "@/components/home/Features";
import SubscribeBanner from "@/components/home/SubscribeBanner";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = "Bedtime Stories - Soothing Stories for Kids";
  }, []);

  // Handle RTL layout for Arabic
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <div className="flex flex-col">
      {/* PricingPopup - Making sure it's rendered for non-authenticated users */}
      <PricingPopup />
      
      {/* Component Sections */}
      <Hero />
      <FreeStory />
      <FeaturedStories />
      <Features />
      <SubscribeBanner />
    </div>
  );
};

export default Index;
