import { ChevronLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ShareDialog } from "../story/ShareDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CourseHeaderProps {
  onBackClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  courseTitle: string;
  courseDescription?: string;
}

export const CourseHeader = ({ 
  onBackClick, 
  isFavorite, 
  onToggleFavorite, 
  courseTitle, 
  courseDescription 
}: CourseHeaderProps) => {
  const { t } = useTranslation('courses');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    onToggleFavorite();
  };

  return (
    <div className="mb-2 flex flex-wrap justify-between items-center">
      <Button variant="tertiary" onClick={onBackClick} className="rounded-md shadow">
        <ChevronLeft className="rtl:rotate-180 me-1 h-4 w-4" /> {t('button.backToCourses')}
      </Button>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="tertiary" 
          size="icon" 
          onClick={handleFavoriteClick} 
          className={cn("rounded-md shadow", isFavorite && "text-red-500")}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
        </Button>
        
        <ShareDialog 
          storyTitle={courseTitle}
          storyDescription={courseDescription}
        />
      </div>
    </div>
  );
};
