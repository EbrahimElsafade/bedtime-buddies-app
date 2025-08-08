
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";
import { getMultilingualText } from "@/utils/multilingualUtils";

interface HomePageSettings {
  freeStory: string;
  freeStoryEnabled: boolean;
  storiesSection: boolean;
  topRated: boolean;
  courses: boolean;
  specialStory: boolean;
}

const FreeStory = () => {
  const { t } = useTranslation(['misc', 'stories']);

  // Fetch home page settings to get the selected free story
  const { data: settings } = useQuery({
    queryKey: ["appearance-settings", "home_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appearance_settings")
        .select("setting_value")
        .eq("setting_key", "home_page")
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value as unknown as HomePageSettings;
    }
  });

  // Fetch the selected free story details
  const { data: freeStory, isLoading } = useQuery({
    queryKey: ["free-story", settings?.freeStory],
    queryFn: async () => {
      if (!settings?.freeStory) return null;
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", settings.freeStory)
        .eq("is_published", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!settings?.freeStory && !!settings?.freeStoryEnabled
  });

  // Don't render if the free story section is disabled, loading, or no story selected
  if (!settings?.freeStoryEnabled || isLoading || !settings?.freeStory || !freeStory) return null;

  const coverImage = freeStory.cover_image ? getImageUrl(freeStory.cover_image) : '/placeholder.svg';
  const storyTitle = getMultilingualText(freeStory.title, 'en', 'en');
  const storyDescription = getMultilingualText(freeStory.description, 'en', 'en');

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-transparent to-dream-light/10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">{t('misc:free.story')}</h2>
          <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <Link to={`/stories/${freeStory.id}`}>
          <Card className="story-card overflow-hidden border-2 border-moon-light/50 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/3 h-72 md:h-72 relative">
                <img 
                  src={coverImage} 
                  alt={storyTitle} 
                  className="w-full h-72 object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6">
                <CardTitle className="text-xl md:text-2xl mb-2 text-dream-DEFAULT">{storyTitle}</CardTitle>
                <CardDescription className="mb-4 text-dream-DEFAULT dark:text-foreground">{storyDescription}</CardDescription>
                <div className="flex items-center text-sm text-dream-DEFAULT dark:text-foreground">
                  <span className="mr-4">{freeStory.duration} {t('stories:duration')}</span>
                  <span>{freeStory.languages.map((lang: string) => {
                    if (lang === 'en') return 'English';
                    if (lang === 'ar-eg') return 'Arabic (Egyptian)';
                    if (lang === 'ar-fos7a') return 'Arabic (Fos7a)';
                    return '';
                  }).join(', ')}</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default FreeStory;
