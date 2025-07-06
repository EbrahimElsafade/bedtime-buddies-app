
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";

const PopularStories = () => {
  const { t } = useTranslation(['misc', 'stories']);

  const { data: popularStories = [], isLoading } = useQuery({
    queryKey: ["popular-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .limit(3)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching popular stories:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  const handleViewAllClick = (e) => {
    console.log("View All Stories button clicked in PopularStories");
    // Don't prevent default - let Link handle navigation
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">{t('stories:popular')}</h2>
            <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
              {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="story-card h-[400px] overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm animate-pulse pb-4">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">{t('stories:popular')}</h2>
          <Link 
            to="/stories" 
            className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center"
            onClick={handleViewAllClick}
          >
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularStories.map((story) => {
            const imageUrl = getImageUrl(story.cover_image);
            
            return (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card className="story-card h-[400px] overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col pb-4">
                  <div className="aspect-[3/2] relative">
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={story.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Popular story image failed to load:', story.cover_image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    {story.is_free ? (
                      <div className="absolute top-2 end-2 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                        {t('misc:free.tag')}
                      </div>
                    ) : (
                      <div className="absolute top-2 end-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                        {t('misc:premium.tag')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <CardHeader className="pb-2 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg text-dream-DEFAULT line-clamp-2 flex-1">{story.title}</CardTitle>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="secondary" className="bg-dream-light/30 text-dream-DEFAULT text-xs">
                            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                          </Badge>
                          <div className="flex items-center text-xs text-dream-DEFAULT">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{story.duration} {t('misc:duration')}</span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground text-sm leading-relaxed">
                        {story.description}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Fun decorative elements specific to this section */}
      <div className="absolute bottom-4 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="opacity-10">
          <path fill="#8B5CF6" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default PopularStories;
