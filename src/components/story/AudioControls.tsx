
import { useState } from "react";
import { VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Story, StorySection } from "@/types/story";

interface AudioControlsProps {
  story: Story;
  currentSection?: StorySection;
  currentLanguage: string;
}

export const AudioControls = ({ story, currentSection, currentLanguage }: AudioControlsProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Determine if audio is available
  const hasAudio = story.audio_mode === 'single_story' 
    ? !!story.story_audio 
    : !!(currentSection?.voices?.[currentLanguage]);

  const toggleAudio = () => {
    if (hasAudio) {
      // In a real app, this would control audio playback
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  if (!hasAudio) return null;

  return (
    <div className="flex justify-center mb-8">
      <Button 
        onClick={toggleAudio} 
        variant="outline" 
        className="rounded-full"
      >
        {isAudioPlaying ? (
          <>
            <VolumeX className="mr-2 h-4 w-4" /> Mute Narration
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-4 w-4" /> 
            Play {story.audio_mode === 'single_story' ? 'Story' : 'Section'} Narration
          </>
        )}
      </Button>
    </div>
  );
};
