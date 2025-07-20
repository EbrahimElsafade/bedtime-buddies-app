import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Story } from "@/types/story";
import { getImageUrl } from "@/utils/imageUtils";
import { AudioControls } from "./AudioControls";

interface StoryContentProps {
  story: Story;
  currentLanguage: string;
  currentSectionDir: "rtl" | "ltr";
  storyTitle: string;
  currentSectionIndex?: number;
  onSectionChange?: (index: number) => void;
}

export const StoryContent = ({
  story,
  currentLanguage,
  currentSectionDir,
  storyTitle,
  currentSectionIndex = 0,
  onSectionChange,
}: StoryContentProps) => {
  const currentSection = story.sections[currentSectionIndex];
  const currentText =
    currentSection?.texts[currentLanguage] ||
    "Content not available in selected language";

  const currentImage = currentSection?.image
    ? getImageUrl(currentSection.image)
    : getImageUrl(story.cover_image);

  const handleNextSection = () => {
    if (currentSectionIndex < story.sections.length - 1 && onSectionChange) {
      onSectionChange(currentSectionIndex + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0 && onSectionChange) {
      onSectionChange(currentSectionIndex - 1);
    }
  };

  return (
    <Card
      dir={currentSectionDir}
      className="overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm mb-4 md:mb-6"
    >
      <div className="grid">
        {/* Story Section Image */}
        <div className="w-full">
          {currentImage ? (
            <img
              src={currentImage}
              alt={storyTitle}
              className="w-full h-64 md:h-full object-cover aspect-square md:aspect-auto"
              onError={(e) => {
                console.log("Image failed to load:", currentImage);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center aspect-square md:aspect-auto">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Story Section Text */}
        <div className="w-full  p-4 md:p-6 flex flex-col">
          <div className="flex-grow">
            <p className="text-lg md:text-3xl leading-relaxed pb-4">
              {currentText}
            </p>
          </div>

          <AudioControls
            story={story}
            currentSection={currentSection}
            currentLanguage={currentLanguage}
            currentSectionIndex={currentSectionIndex}
            currentSectionDir={currentSectionDir}
            onSectionChange={onSectionChange}
          />

          {/* Section Navigation - only show if not in single story audio mode or if no sections */}
          {(story.audio_mode !== "single_story" ||
            story.sections.length > 1) && (
            <div className="flex justify-between items-center mt-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
                aria-label="Previous section"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronLeft className="rtl:rotate-180 h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <span className="text-xs md:text-sm text-muted-foreground px-2">
                {currentSectionIndex + 1} / {story.sections.length || 1}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextSection}
                disabled={currentSectionIndex === story.sections.length - 1}
                aria-label="Next section"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronRight className="rtl:rotate-180 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
