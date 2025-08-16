
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const SubscribeBanner = () => {
  const { t } = useTranslation('misc');

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-dream-DEFAULT to-dream-dark text-black dark:text-white">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bubbly mb-4">{t('subscribe.title')}</h2>
          <p className="mb-6">
            {t('subscribe.subtitle')}
          </p>
          <Link to="/subscription">
            <Button size="lg" variant="outline" className="rounded-full border-white text-black dark:text-white bg-transparent hover:bg-white hover:text-black dark:hover:text-black">
              {t('subscribe.button')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SubscribeBanner;
