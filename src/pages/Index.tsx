
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import PricingPopup from "@/components/PricingPopup";
import Hero from "@/components/home/Hero";
import FreeStory from "@/components/home/FreeStory";
import FeaturedStories from "@/components/home/FeaturedStories";
import Features from "@/components/home/Features";
import SubscribeBanner from "@/components/home/SubscribeBanner";
import PopularStories from "@/components/home/PopularStories";
import EntertainmentStories from "@/components/home/EntertainmentStories";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import FunElements from "@/components/home/FunElements";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    document.title = "Bedtime Stories - Soothing Stories for Kids";
  }, []);

  // Handle RTL layout for Arabic
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return (
    <div className="flex flex-col relative">
      {/* Fun floating elements */}
      <FunElements />
      
      {/* PricingPopup - Making sure it's rendered for non-authenticated users */}
      <PricingPopup />
      
      {/* Component Sections */}
      <Hero />
      <FreeStory />
      <FeaturedStories />
      <PopularStories />
      <EntertainmentStories />
      <FeaturedCourses />
      <Features />
      <SubscribeBanner />
    </div>
  );
};

export default Index;
