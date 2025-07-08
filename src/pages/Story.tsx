
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

const Story = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: story, isLoading, error } = useStoryData(storyId);
  const { currentLanguage, setCurrentLanguage } = useStoryLanguage(story);

  useEffect(() => {
    if (story) {
      document.title = `${story.title} - Bedtime Stories`;
    }
  }, [story]);

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

  const currentSection = story.sections[0]; // For audio controls
  
  const toggleFavorite = () => {
    if (isAuthenticated) {
      setIsFavorite(!isFavorite);
    } else {
      navigate("/login");
    }
  };

  const canAccessStory = story.is_free || (isAuthenticated && profile?.is_premium);
  
  // Get title for current language
  const getStoryTitle = () => {
    if (story.title && typeof story.title === 'object') {
      return (story.title as Record<string, string>)[currentLanguage] || (story.title as Record<string, string>)['en'] || Object.values(story.title as Record<string, string>)[0] || 'Untitled Story';
    }
    return story.title || 'Untitled Story';
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
          onLanguageChange={(value) => setCurrentLanguage(value as any)}
        />

        <StoryInfo 
          story={story}
          currentLanguage={currentLanguage}
        />
        
        {canAccessStory ? (
          <>
            <StoryContent 
              story={story}
              currentLanguage={currentLanguage}
              storyTitle={getStoryTitle()}
            />
            
            <AudioControls 
              story={story}
              currentSection={currentSection}
              currentLanguage={currentLanguage}
            />
          </>
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
