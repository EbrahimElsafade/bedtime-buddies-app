
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { getStoriesByCategory } from "@/data/stories";

const PopularStories = () => {
  const { t } = useTranslation(['misc', 'stories']);
  const popularStories = getStoriesByCategory('sleeping').slice(0, 3);

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">{t('misc:popular.title')}</h2>
          <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularStories.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-[3/2] relative">
                  <img 
                    src={story.coverImage} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/80 dark:bg-nightsky-light/80 text-xs px-2 py-1 rounded-full">
                    {story.duration} {t('misc:duration')}
                  </div>
                  {story.isFree ? (
                    <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      {t('misc:free.tag')}
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      {t('misc:premium.tag')}
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-dream-DEFAULT">{story.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground">{story.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
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
