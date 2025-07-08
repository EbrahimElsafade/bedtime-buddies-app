
import { ChevronLeft, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StoryHeaderProps {
  onBackClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const StoryHeader = ({ onBackClick, isFavorite, onToggleFavorite }: StoryHeaderProps) => {
  return (
    <div className="mb-6 flex flex-wrap justify-between items-center">
      <Button variant="ghost" onClick={onBackClick} className="mb-4 px-2">
        <ChevronLeft className="rtl:rotate-180 me-1 h-4 w-4" /> Back to Stories
      </Button>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleFavorite} 
          className={cn("rounded-full", isFavorite && "text-red-500")}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          aria-label="Share story"
        >
          <Share className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
