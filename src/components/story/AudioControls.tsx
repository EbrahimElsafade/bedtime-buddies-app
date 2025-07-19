import { AudioPlayer } from "./AudioPlayer";
import { Story, StorySection } from "@/types/story";

interface AudioControlsProps {
  story: Story;
  currentSection?: StorySection;
  currentLanguage: string;
  currentSectionDir: "rtl" | "ltr";
  currentSectionIndex?: number;
  onSectionChange?: (index: number) => void;
}

export const AudioControls = ({
  story,
  currentSection,
  currentLanguage,
  currentSectionIndex = 0,
  onSectionChange,
  currentSectionDir,
}: AudioControlsProps) => {
  // Determine audio source based on mode
  const getAudioSource = () => {
    if (story.audio_mode === "single_story" && story.story_audio) {
      // Handle multilingual story audio
      const audioUrl =
        typeof story.story_audio === "string"
          ? story.story_audio
          : story.story_audio[currentLanguage] ||
            story.story_audio[Object.keys(story.story_audio)[0]];

      if (audioUrl) {
        return {
          url: audioUrl,
          title: `Story: ${
            typeof story.title === "string"
              ? story.title
              : story.title[currentLanguage] || "Unknown"
          }`,
        };
      }
    } else if (
      story.audio_mode === "per_section" &&
      currentSection?.voices?.[currentLanguage]
    ) {
      return {
        url: currentSection.voices[currentLanguage],
        title: `Section ${currentSection.order}`,
      };
    }
    return null;
  };

  const audioSource = getAudioSource();

  if (!audioSource) {
    return null;
  }

  const handleNext = () => {
    if (
      story.audio_mode === "per_section" &&
      onSectionChange &&
      currentSectionIndex < story.sections.length - 1
    ) {
      onSectionChange(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (
      story.audio_mode === "per_section" &&
      onSectionChange &&
      currentSectionIndex > 0
    ) {
      onSectionChange(currentSectionIndex - 1);
    }
  };

  const hasNext =
    story.audio_mode === "per_section" &&
    currentSectionIndex < story.sections.length - 1;
  const hasPrevious =
    story.audio_mode === "per_section" && currentSectionIndex > 0;

  return (
    <div>
      <AudioPlayer
        audioUrl={audioSource.url}
        title={audioSource.title}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        currentSectionDir={currentSectionDir}
      />
    </div>
  );
};
