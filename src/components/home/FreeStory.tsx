
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { getFreeStories } from "@/data/stories";

const FreeStory = () => {
  const { t } = useTranslation(['misc', 'stories']);
  const freeStory = getFreeStories()[0];

  if (!freeStory) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-transparent to-dream-light/10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">{t('misc:free.story')}</h2>
          <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <Card className="story-card overflow-hidden border-2 border-moon-light/50 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
          <div className="md:flex">
            <div className="md:w-1/3 aspect-[3/2] md:aspect-auto relative">
              <img 
                src={freeStory.coverImage} 
                alt={freeStory.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                {t('misc:free.tag')}
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <CardTitle className="text-xl md:text-2xl mb-2 text-dream-DEFAULT">{freeStory.title}</CardTitle>
              <CardDescription className="mb-4 text-dream-DEFAULT dark:text-foreground">{freeStory.description}</CardDescription>
              <div className="flex items-center text-sm text-dream-DEFAULT dark:text-foreground mb-6">
                <span className="mr-4">{freeStory.duration} {t('stories:duration')}</span>
                <span>{freeStory.languages.map(lang => {
                  if (lang === 'en') return 'English';
                  if (lang === 'ar-eg') return 'Arabic (Egyptian)';
                  if (lang === 'ar-fos7a') return 'Arabic (Fos7a)';
                  return '';
                }).join(', ')}</span>
              </div>
              <Link to={`/stories/${freeStory.id}`}>
                <Button className="bg-dream-DEFAULT hover:bg-dream-dark text-black dark:text-white dark:text-white">{t('misc:button.readStory')}</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FreeStory;
