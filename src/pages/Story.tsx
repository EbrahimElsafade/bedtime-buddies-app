import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStoryData } from "@/hooks/useStoryData";
import { useStoryLanguage } from "@/hooks/useStoryLanguage";
import { StoryHeader } from "@/components/story/StoryHeader";
import { LanguageSelector } from "@/components/story/LanguageSelector";
import { StoryInfo } from "@/components/story/StoryInfo";
import { StoryContent } from "@/components/story/StoryContent";
import { AudioControls } from "@/components/story/AudioControls";
import { PremiumMessage } from "@/components/story/PremiumMessage";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Story = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const { data: story, isLoading, error } = useStoryData(storyId);
  const { currentLanguage, setCurrentLanguage } = useStoryLanguage(story);
  const currentLanguageKey = currentLanguage[0] + currentLanguage[1];
  const currentStoryDir = currentLanguageKey === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (story) {
      const storyTitle = getMultilingualText(
        story.title,
        currentLanguage,
        "en"
      );
      document.title = `${storyTitle} - Bedtime Stories`;
    }
  }, [story, currentLanguage]);

  useEffect(() => {
    if (error || (!isLoading && !story)) {
      navigate("/stories", { replace: true });
    }
  }, [error, story, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="aspect-[3/2] bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  const currentSection = story.sections[currentSectionIndex];

  const toggleFavorite = () => {
    if (isAuthenticated) {
      setIsFavorite(!isFavorite);
    } else {
      navigate("/login");
    }
  };

  const canAccessStory =
    story.is_free || (isAuthenticated && profile?.is_premium);

  // Get title for current language
  const getStoryTitle = () => {
    return (
      getMultilingualText(story.title, currentLanguage, "en") ||
      "Untitled Story"
    );
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <StoryHeader
          onBackClick={() => navigate("/stories")}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

        <LanguageSelector
          languages={story.languages}
          currentLanguage={currentLanguage}
          onLanguageChange={(value) => setCurrentLanguage(value as "en" | "ar-eg" | "ar-fos7a")}
        />

        <StoryInfo
          story={story}
          currentLanguageKey={currentLanguageKey}
          currentSectionDir={currentStoryDir}
        />

        {canAccessStory ? (
          <StoryContent
            story={story}
            currentSectionDir={currentStoryDir}
            currentLanguage={currentLanguage}
            storyTitle={getStoryTitle()}
            currentSectionIndex={currentSectionIndex}
            onSectionChange={setCurrentSectionIndex}
          />
        ) : (
          <PremiumMessage
            onSubscriptionClick={() => navigate("/subscription")}
            onLoginClick={() => navigate("/login")}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </div>
  );
};

export default Story;
