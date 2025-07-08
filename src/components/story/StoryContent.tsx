
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Story } from "@/types/story";
import { getImageUrl } from "@/utils/imageUtils";

interface StoryContentProps {
  story: Story;
  currentLanguage: string;
  storyTitle: string;
}

export const StoryContent = ({ story, currentLanguage, storyTitle }: StoryContentProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const currentSection = story.sections[currentSectionIndex];
  const currentText = currentSection?.texts[currentLanguage] || "Content not available in selected language";
  const currentImage = currentSection?.image ? getImageUrl(currentSection.image) : getImageUrl(story.cover_image);

  const handleNextSection = () => {
    if (currentSectionIndex < story.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };
  
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm mb-6">
      <div className="md:flex">
        {/* Story Section Image */}
        <div className="md:w-1/2">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={storyTitle} 
              className="w-full h-full object-cover aspect-square md:aspect-auto"
              onError={(e) => {
                console.log('Image failed to load:', currentImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center aspect-square md:aspect-auto">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>
        
        {/* Story Section Text */}
        <div className="md:w-1/2 p-6 flex flex-col">
          <div className="flex-grow">
            <p className="text-lg leading-relaxed">
              {currentText}
            </p>
          </div>
          
          {/* Section Navigation - only show if not in single story audio mode or if no sections */}
          {(story.audio_mode !== 'single_story' || story.sections.length > 1) && (
            <div className="flex justify-between items-center pt-4 mt-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrevSection} 
                disabled={currentSectionIndex === 0}
                aria-label="Previous section"
              >
                <ChevronLeft className="rtl:rotate-180 h-5 w-5" />
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentSectionIndex + 1} / {story.sections.length || 1}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextSection} 
                disabled={currentSectionIndex === story.sections.length - 1}
                aria-label="Next section"
              >
                <ChevronRight className="rtl:rotate-180 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
