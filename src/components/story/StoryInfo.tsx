
import { Story } from "@/types/story";

interface StoryInfoProps {
  story: Story;
  currentLanguage: string;
}

export const StoryInfo = ({ story, currentLanguage }: StoryInfoProps) => {
  const getStoryTitle = () => {
    if (story.title && typeof story.title === 'object') {
      return (story.title as Record<string, string>)[currentLanguage] || (story.title as Record<string, string>)['en'] || Object.values(story.title as Record<string, string>)[0] || 'Untitled Story';
    }
    return story.title || 'Untitled Story';
  };

  const getStoryDescription = () => {
    if (story.description && typeof story.description === 'object') {
      return (story.description as Record<string, string>)[currentLanguage] || (story.description as Record<string, string>)['en'] || Object.values(story.description as Record<string, string>)[0] || 'No description available';
    }
    return story.description || 'No description available';
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bubbly mb-2">{getStoryTitle()}</h1>
      <p className="text-muted-foreground mb-4">{getStoryDescription()}</p>
      
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
        <span className="px-2 py-1 bg-secondary/50 rounded-full">
          {story.audio_mode === 'single_story' ? 'Single Audio' : 'Section Audio'}
        </span>
      </div>
    </div>
  );
};
