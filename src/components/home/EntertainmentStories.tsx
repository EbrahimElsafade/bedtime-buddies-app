
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { getStoriesByCategory } from "@/data/stories";

const EntertainmentStories = () => {
  const { t } = useTranslation(['misc', 'stories']);
  const entertainmentStories = getStoriesByCategory('entertainment').slice(0, 2);
  
  // If we don't have entertainment stories, use developmental stories as fallback
  const stories = entertainmentStories.length ? entertainmentStories : getStoriesByCategory('developmental').slice(0, 2);
  
  if (!stories.length) return null;

  return (
    <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-transparent to-primary/10 relative">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bubbly text-primary-foreground">
            {t('misc:entertainment.title')}
          </h2>
          <Link to="/stories" className="text-primary-foreground hover:underline text-sm font-medium flex items-center shrink-0">
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {stories.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="story-card overflow-hidden border-moon-light/50 bg-background/50  backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-48 md:h-48 relative overflow-hidden">
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                    {story.isFree ? (
                      <div className="absolute top-2 left-2 bg-primary-foreground text-background text-xs font-medium px-2 py-1 rounded-full">
                        {t('misc:free.tag')}
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-moon-DEFAULT text-background text-xs font-medium px-2 py-1 rounded-full">
                        {t('misc:premium.tag')}
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-2/3 p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl mb-2 text-primary-foreground">{story.title}</CardTitle>
                    <CardDescription className="mb-3 md:mb-4 text-primary-foreground  text-sm md:text-base line-clamp-3">{story.description}</CardDescription>
                    <div className="flex items-center text-sm text-primary-foreground ">
                      <span className="mr-4">{story.duration} {t('misc:duration')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 md:w-32 md:h-32 bg-moon-light/10 rounded-full blur-xl"></div>
    </section>
  );
};

export default EntertainmentStories;
