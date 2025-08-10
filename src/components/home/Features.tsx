
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation('features');

  return (
    <section className="py-8 md:py-12 px-4 bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bubbly mb-3 md:mb-4 text-wonder-DEFAULT">{t('title')}</h2>
          <p className="text-wonder-DEFAULT dark:text-foreground text-sm md:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white/70 dark:bg-card/70 p-4 md:p-6 rounded-xl backdrop-blur-sm border border-wonder-light/20">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-magic-light/30 flex items-center justify-center mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">📚</span>
            </div>
            <h3 className="text-lg md:text-xl font-bubbly mb-2 text-wonder-DEFAULT">{t('soothing.title')}</h3>
            <p className="text-wonder-DEFAULT dark:text-foreground text-sm md:text-base">
              {t('soothing.desc')}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-card/70 p-4 md:p-6 rounded-xl backdrop-blur-sm border border-wonder-light/20">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-joy-light/30 flex items-center justify-center mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">🌎</span>
            </div>
            <h3 className="text-lg md:text-xl font-bubbly mb-2 text-wonder-DEFAULT">{t('languages.title')}</h3>
            <p className="text-wonder-DEFAULT dark:text-foreground text-sm md:text-base">
              {t('languages.desc')}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-card/70 p-4 md:p-6 rounded-xl backdrop-blur-sm border border-wonder-light/20 md:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-adventure-light/30 flex items-center justify-center mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">🎮</span>
            </div>
            <h3 className="text-lg md:text-xl font-bubbly mb-2 text-wonder-DEFAULT">{t('games.title')}</h3>
            <p className="text-wonder-DEFAULT dark:text-foreground text-sm md:text-base">
              {t('games.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
