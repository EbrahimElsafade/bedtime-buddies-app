
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { Loader2, Heart, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils/imageUtils";

export const FavoritesTab = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, removeFromFavorites } = useFavorites();
  const { t, i18n } = useTranslation(['stories', 'misc']);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Favorite Stories</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your favorites...</p>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Favorite Stories</CardTitle>
          <CardDescription>
            Stories you've marked as favorites
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven't added any stories to favorites yet.
          </p>
          <Button onClick={() => navigate("/stories")}>
            Browse Stories
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Favorite Stories</CardTitle>
        <CardDescription>
          {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {favorites.map((favorite) => {
            const story = favorite.stories;
            if (!story) return null;

            // Get title in current language
            const title = typeof story.title === 'object' 
              ? story.title[i18n.language] || story.title['en'] || Object.values(story.title)[0]
              : story.title;

            // Get description in current language
            const description = typeof story.description === 'object'
              ? story.description[i18n.language] || story.description['en'] || Object.values(story.description)[0]
              : story.description;

            return (
              <div
                key={favorite.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <img
                  src={getImageUrl(story.cover_image)}
                  alt={title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={story.is_free ? "secondary" : "default"}>
                      {story.is_free ? t('type.free') : t('type.premium')}
                    </Badge>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {story.duration} {t('duration')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromFavorites(story.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                  </Button>
                  
                  <Button
                    onClick={() => navigate(`/story/${story.id}`)}
                    size="sm"
                  >
                    {t('readNow')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
