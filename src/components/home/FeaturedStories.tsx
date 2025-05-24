
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedStories = () => {
  const { t } = useLanguage();

  const { data: featuredStories = [], isLoading } = useQuery({
    queryKey: ["featured-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .limit(3)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching featured stories:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Helper function to get proper image URL
  const getImageUrl = (coverImage: string | null) => {
    if (!coverImage) {
      return 'https://images.unsplash.com/photo-1532251632967-86af52cbab08?q=80&w=1000';
    }
    
    // If it's already a full URL (like Unsplash), return as is
    if (coverImage.startsWith('http')) {
      return coverImage;
    }
    
    // If it's a relative path, construct the Supabase storage URL
    const { data: urlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(coverImage);
    
    return urlData.publicUrl;
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bubbly mb-6 text-dream-DEFAULT">{t('featured.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm animate-pulse">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
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
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bubbly mb-6 text-dream-DEFAULT">{t('featured.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <Card key={story.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="aspect-[3/2] relative">
                <img 
                  src={getImageUrl(story.cover_image)} 
                  alt={story.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1532251632967-86af52cbab08?q=80&w=1000';
                  }}
                />
                {story.is_free && (
                  <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white dark:text-white text-xs font-medium px-2 py-1 rounded-full">
                    FREE
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-dream-DEFAULT">{story.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground">{story.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-dream-DEFAULT dark:text-foreground">
                  <span className="mr-4">{story.duration} {t('duration')}</span>
                  <span>{story.category.charAt(0).toUpperCase() + story.category.slice(1)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/stories/${story.id}`} className="w-full">
                  <Button 
                    className={cn(
                      "w-full", 
                      story.is_free 
                        ? "bg-dream-DEFAULT hover:bg-dream-dark text-white dark:text-white" 
                        : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                    )}
                  >
                    {story.is_free ? t('button.readNow') : t('button.premium')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStories;
