
import { ChevronLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ShareDialog } from "./ShareDialog";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

interface StoryHeaderProps {
  onBackClick: () => void;
  storyTitle: string;
  storyDescription?: string;
}

export const StoryHeader = ({ 
  onBackClick, 
  storyTitle, 
  storyDescription 
}: StoryHeaderProps) => {
  const { t } = useTranslation('stories');
  const { id: storyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (storyId) {
      toggleFavorite(storyId);
    }
  };

  const isStoryFavorite = storyId ? isFavorite(storyId) : false;

  return (
    <div className="mb-6 flex flex-wrap justify-between items-center">
      <Button variant="ghost" onClick={onBackClick} className="mb-4 px-2">
        <ChevronLeft className="rtl:rotate-180 me-1 h-4 w-4" /> {t('backToStories')}
      </Button>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggleFavorite}
          className={cn("rounded-full", isStoryFavorite && "text-red-500")}
          aria-label={isStoryFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isStoryFavorite && "fill-red-500")} />
        </Button>
        
        <ShareDialog 
          storyTitle={storyTitle}
          storyDescription={storyDescription}
        />
      </div>
    </div>
  );
};
