
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeaturedStories } from "@/data/stories";
import { cn } from "@/lib/utils";

const FeaturedStories = () => {
  const { t } = useLanguage();
  const featuredStories = getFeaturedStories().slice(0, 3);

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bubbly mb-6 text-dream-DEFAULT">{t('featured.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <Card key={story.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="aspect-[3/2] relative">
                <img 
                  src={story.coverImage} 
                  alt={story.title} 
                  className="w-full h-full object-cover"
                />
                {story.isFree && (
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
                      story.isFree 
                        ? "bg-dream-DEFAULT hover:bg-dream-dark text-white dark:text-white" 
                        : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                    )}
                  >
                    {story.isFree ? t('button.readNow') : t('button.premium')}
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
