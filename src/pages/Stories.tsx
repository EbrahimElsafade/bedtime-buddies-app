
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils/imageUtils";
import { getMultilingualText, getAppLanguageCode } from "@/utils/multilingualUtils";
import { useLanguage } from "@/contexts/LanguageContext";

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { t, i18n } = useTranslation(['common', 'stories']);
  const { language } = useLanguage();

  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('stories', { ns: 'navigation' })}`;
  }, [t]);

  const isRTL = i18n.language === 'ar';
  const currentAppLanguage = getAppLanguageCode(language);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories", language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching stories:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["story-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_categories")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  const filteredStories = stories.filter(story => {
    const storyTitle = getMultilingualText(story.title, currentAppLanguage, 'en');
    const storyDescription = getMultilingualText(story.description, currentAppLanguage, 'en');
    
    const matchesSearch = searchTerm === "" || 
      storyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storyDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="py-4 md:py-8 lg:py-12 px-3 md:px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 md:mb-6 lg:mb-8 text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3 lg:mb-4 leading-tight">
              {t('stories:allStories')}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[20rem] animate-pulse">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 lg:py-12 px-3 md:px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 md:mb-6 lg:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3 lg:mb-4 leading-tight">
            {t('stories:allStories')}
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t('stories:browseCollection')}
          </p>
        </div>

        <div className="mb-4 md:mb-6 lg:mb-8 space-y-3 md:space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              type="text"
              placeholder={t('stories:searchStories')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-2 text-sm md:text-base`}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            >
              {t('stories:allCategories')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
              >
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground text-sm md:text-base">
              {searchTerm || selectedCategory !== "all" 
                ? t('stories:noStoriesFound') 
                : t('stories:noStoriesAvailable')
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredStories.map((story) => {
              const imageUrl = getImageUrl(story.cover_image);
              const storyTitle = getMultilingualText(story.title, currentAppLanguage, 'en');
              const storyDescription = getMultilingualText(story.description, currentAppLanguage, 'en');
              
              return (
                <Link key={story.id} to={`/stories/${story.id}`}>
                  <Card className="story-card h-[20rem] md:h-[22rem] overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <div className="aspect-[3/2] relative">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={storyTitle} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Story image failed to load:', story.cover_image);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                      {story.is_free ? (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                          {t('misc:free.tag')}
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                          {t('misc:premium.tag')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-3 md:p-4">
                      <CardHeader className="p-0 pb-2 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-sm md:text-base lg:text-lg text-dream-DEFAULT line-clamp-2 flex-1">
                            {storyTitle}
                          </CardTitle>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <Badge variant="secondary" className="bg-dream-light/30 text-dream-DEFAULT text-xs">
                              {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                            </Badge>
                            <div className="flex items-center text-xs text-dream-DEFAULT">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{story.duration} {t('misc:duration')}</span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground text-xs md:text-sm leading-relaxed">
                          {storyDescription}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
