import { Story } from "@/types/story";
import { getMultilingualText } from "@/utils/multilingualUtils";
import { useTranslation } from "react-i18next";

interface StoryInfoProps {
  story: Story;
  currentLanguageKey: string;
  currentSectionDir: "rtl" | "ltr";
}

export const StoryInfo = ({
  story,
  currentLanguageKey,
  currentSectionDir,
}: StoryInfoProps) => {
  const getStoryTitle = () => {
    return (
      getMultilingualText(story.title, currentLanguageKey, "en") ||
      "Untitled Story"
    );
  };

  const getStoryDescription = () => {
    return (
      getMultilingualText(story.description, currentLanguageKey, "en") ||
      "No description available"
    );
  };

  return (
    <div className="mb-4" dir={currentSectionDir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-2">
          {getStoryTitle()}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-secondary/50 rounded-full">
            {story.duration} mins
          </span>
          <span className="px-2 py-1 bg-secondary/50 rounded-full">
            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
          </span>
          {story.is_free ? (
            <span className="px-2 py-1 bg-dream-DEFAULT/20 text-dream-DEFAULT rounded-full font-medium">
              Free
            </span>
          ) : (
            <span className="px-2 py-1 bg-moon-DEFAULT/20 text-moon-dark rounded-full font-medium">
              Premium
            </span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-start">
        {getStoryDescription()}
      </p>
    </div>
  );
};
