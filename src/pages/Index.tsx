
import { useTranslation } from "react-i18next";
import Hero from "@/components/home/Hero";
import FeaturedStories from "@/components/home/FeaturedStories";
import PopularStories from "@/components/home/PopularStories";
import FreeStory from "@/components/home/FreeStory";
import EntertainmentStories from "@/components/home/EntertainmentStories";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import Features from "@/components/home/Features";
import SubscribeBanner from "@/components/home/SubscribeBanner";
import FunElements from "@/components/home/FunElements";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Hero />
      <FunElements />
      <FeaturedStories />
      <PopularStories />
      <FreeStory />
      <EntertainmentStories />
      <FeaturedCourses />
      <Features />
      <SubscribeBanner />
    </div>
  );
};

export default Index;
