
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation(['notFound', 'misc']);

  useEffect(() => {
    document.title = `${t('misc:layout.appName')} - ${t('title')}`;
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname, t]);

  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 bg-primary rounded-full mx-auto flex items-center justify-center mb-6">
          <span className="text-6xl">😴</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bubbly mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('message')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="default">
              {t('returnHome')}
            </Button>
          </Link>
          <Link to="/stories">
            <Button variant="outline">
              {t('browseStories')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
