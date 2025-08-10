
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, Book } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation('notFound');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-dream-DEFAULT">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('message')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              {t('returnHome')}
            </Button>
          </Link>
          <Link to="/stories">
            <Button variant="outline" className="w-full sm:w-auto">
              <Book className="w-4 h-4 mr-2" />
              {t('browseStories')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
