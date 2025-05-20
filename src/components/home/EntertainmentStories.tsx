
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStoriesByCategory } from "@/data/stories";
import { cn } from "@/lib/utils";

const EntertainmentStories = () => {
  const { t } = useLanguage();
  const entertainmentStories = getStoriesByCategory('entertainment').slice(0, 2);
  
  // If we don't have entertainment stories, use developmental stories as fallback
  const stories = entertainmentStories.length ? entertainmentStories : getStoriesByCategory('developmental').slice(0, 2);
  
  if (!stories.length) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-transparent to-dream-light/10 relative">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">
            {t('entertainment.title') || 'Fun Stories'}
          </h2>
          <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
            {t('free.viewAll') || 'View All'} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="story-card overflow-hidden border-moon-light/50 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="md:flex">
                <div className="md:w-1/3 aspect-[3/2] md:aspect-auto relative">
                  <img 
                    src={story.coverImage} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                  {story.isFree ? (
                    <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      {t('free.tag') || 'FREE'}
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      {t('premium.tag') || 'PREMIUM'}
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 p-6">
                  <CardTitle className="text-xl mb-2 text-dream-DEFAULT">{story.title}</CardTitle>
                  <CardDescription className="mb-4 text-dream-DEFAULT dark:text-foreground">{story.description}</CardDescription>
                  <div className="flex items-center text-sm text-dream-DEFAULT dark:text-foreground mb-6">
                    <span className="mr-4">{story.duration} {t('duration') || 'mins'}</span>
                  </div>
                  <Link to={`/stories/${story.id}`}>
                    <Button 
                      className={cn(
                        story.isFree 
                          ? "bg-dream-DEFAULT hover:bg-dream-dark text-white dark:text-white" 
                          : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                      )}
                    >
                      {story.isFree ? t('button.readNow') || 'Read Now' : t('button.premium') || 'Premium'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-dream-light/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-moon-light/10 rounded-full blur-xl"></div>
    </section>
  );
};

export default EntertainmentStories;
