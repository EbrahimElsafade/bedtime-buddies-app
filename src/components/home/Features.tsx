
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation('features');

  return (
    <section className="py-12 px-4 bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bubbly mb-4 text-dream-DEFAULT">{t('title')}</h2>
          <p className="text-dream-DEFAULT dark:text-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
              <span className="text-2xl">🌙</span>
            </div>
            <h3 className="text-xl font-bubbly mb-2 text-dream-DEFAULT">{t('soothing.title')}</h3>
            <p className="text-dream-DEFAULT dark:text-foreground">
              {t('soothing.desc')}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
              <span className="text-2xl">🌎</span>
            </div>
            <h3 className="text-xl font-bubbly mb-2 text-dream-DEFAULT">{t('languages.title')}</h3>
            <p className="text-dream-DEFAULT dark:text-foreground">
              {t('languages.desc')}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
              <span className="text-2xl">🎮</span>
            </div>
            <h3 className="text-xl font-bubbly mb-2 text-dream-DEFAULT">{t('games.title')}</h3>
            <p className="text-dream-DEFAULT dark:text-foreground">
              {t('games.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
