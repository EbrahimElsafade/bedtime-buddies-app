
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Heart, BookOpen } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Favorites = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, i18n } = useTranslation(['stories', 'misc', 'common']);
  const { language } = useLanguage();
  
  // Mock favorites data - in real app this would come from API
  const [favorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  
  // Set page title
  useEffect(() => {
    document.title = "Bedtime Stories - My Favorites";
  }, []);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common:loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bubbly mb-4">{t('stories:favorites.loginRequired')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('stories:favorites.loginDescription')}
          </p>
          <Button onClick={() => navigate("/login")}>
            {t('common:login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-bubbly text-dream-DEFAULT">
              {t('stories:favorites.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t('stories:favorites.description')}
          </p>
        </div>

        {/* Content */}
        {isLoadingFavorites ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[25rem] animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="inline-block p-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                <Heart className="h-16 w-16 text-pink-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <BookOpen className="h-8 w-8 text-purple-400 animate-bounce" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bubbly text-dream-DEFAULT mb-4">
              {t('stories:favorites.empty.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t('stories:favorites.empty.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/stories")}
                className="bg-dream-DEFAULT hover:bg-dream-dark"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t('stories:browse')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
              >
                {t('common:backHome')}
              </Button>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((story: any) => {
              const imageUrl = getImageUrl(story.cover_image);
              const storyTitle = getMultilingualText(story.title, i18n.language, 'en');
              const storyDescription = getMultilingualText(story.description, i18n.language, 'en');

              return (
                <Link key={story.id} to={`/stories/${story.id}`}>
                  <Card className="story-card h-[25rem] cursor-pointer overflow-hidden border-dream-light/20 bg-white/70 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105 dark:bg-nightsky-light/70">
                    <div className="relative h-48 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={storyTitle}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dream-light/30 to-purple-100/30">
                          <BookOpen className="h-12 w-12 text-dream-DEFAULT/60" />
                        </div>
                      )}
                      
                      {/* Heart indicator */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                      </div>
                      
                      {/* Free/Premium badge */}
                      {story.is_free ? (
                        <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                          {t('misc:free.tag')}
                        </div>
                      ) : (
                        <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                          {t('misc:premium.tag')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-1 flex-col">
                      <CardHeader className="flex-1 pb-2">
                        <div className="mb-2 flex items-start justify-between">
                          <CardTitle className="text-dream-DEFAULT line-clamp-2 flex-1 text-lg">
                            {storyTitle}
                          </CardTitle>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="text-dream-DEFAULT bg-dream-light/30 text-xs"
                          >
                            {t(`stories:category.${story.category}`, {
                              defaultValue: story.category.charAt(0).toUpperCase() + story.category.slice(1),
                            })}
                          </Badge>
                          <div className="text-dream-DEFAULT flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{story.duration} {t('misc:duration')}</span>
                          </div>
                        </div>
                        
                        <CardDescription className="text-dream-DEFAULT line-clamp-2 text-sm leading-relaxed dark:text-foreground">
                          {storyDescription}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-white/80 dark:bg-nightsky-light/80 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-bubbly text-dream-DEFAULT mb-2">
                {t('stories:favorites.quickActions')}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/stories")}
                  className="border-dream-light hover:bg-dream-light/20"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t('stories:findMore')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
