
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Story } from '@/types/story'
import { getImageUrl } from '@/utils/imageUtils'
import { AudioControls } from './AudioControls'
import { TextHighlight } from './TextHighlight'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface StoryContentProps {
  story: Story
  currentLanguage: string
  currentSectionDir: 'rtl' | 'ltr'
  storyTitle: string
  currentSectionIndex?: number
  onSectionChange?: (index: number) => void
}

export const StoryContent = ({
  story,
  currentLanguage,
  currentSectionDir,
  storyTitle,
  currentSectionIndex = 0,
  onSectionChange,
}: StoryContentProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const isMobile = useIsMobile()

  const currentSection = story.sections[currentSectionIndex]
  const currentText =
    currentSection?.texts[currentLanguage] ||
    'Content not available in selected language'

  const currentImage = currentSection?.image
    ? getImageUrl(currentSection.image)
    : getImageUrl(story.cover_image)

  // Determine direction based on current story language, not global language
  const getDirectionFromLanguage = (language: string): 'rtl' | 'ltr' => {
    return language.startsWith('ar') ? 'rtl' : 'ltr'
  }

  const storyDirection = getDirectionFromLanguage(currentLanguage)

  const handleNextSection = () => {
    if (currentSectionIndex < story.sections.length - 1 && onSectionChange) {
      onSectionChange(currentSectionIndex + 1)
    }
  }

  const handlePrevSection = () => {
    if (currentSectionIndex > 0 && onSectionChange) {
      onSectionChange(currentSectionIndex - 1)
    }
  }

  const handleAudioTimeUpdate = (currentTime: number, duration: number) => {
    setAudioCurrentTime(currentTime)
    setAudioDuration(duration)
  }

  return (
    <Card
      dir={storyDirection}
      className="mb-4 overflow-hidden border-dream-light/20 bg-white/70 backdrop-blur-sm dark:bg-nightsky-light/70 md:mb-6"
    >
      <div className="flex flex-col">
        {/* Story Section Image */}
        <div className="relative w-full">
          {currentImage ? (
            <img
              src={currentImage}
              alt={storyTitle}
              className="aspect-square h-64 w-full object-cover sm:h-80 md:aspect-auto md:h-96"
              onError={e => {
                console.log('Image failed to load:', currentImage)
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex aspect-square h-64 w-full items-center justify-center bg-gray-200 sm:h-80 md:aspect-auto md:h-96">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          {/* Audio Controls - Desktop overlay */}
          {!isMobile && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <AudioControls
                story={story}
                currentSection={currentSection}
                currentLanguage={currentLanguage}
                currentSectionIndex={currentSectionIndex}
                currentSectionDir={storyDirection}
                onSectionChange={onSectionChange}
                onPlayingChange={setIsAudioPlaying}
                onAudioTimeUpdate={handleAudioTimeUpdate}
              />
            </div>
          )}
        </div>

        {/* Audio Controls - Mobile/Tablet below image */}
        {isMobile && (
          <div className="bg-gradient-to-r from-dream-dark to-dream-light p-4">
            <AudioControls
              story={story}
              currentSection={currentSection}
              currentLanguage={currentLanguage}
              currentSectionIndex={currentSectionIndex}
              currentSectionDir={storyDirection}
              onSectionChange={onSectionChange}
              onPlayingChange={setIsAudioPlaying}
              onAudioTimeUpdate={handleAudioTimeUpdate}
            />
          </div>
        )}

        {/* Story Section Text */}
        <div className="flex w-full flex-col p-4 md:p-6">
          <div className="flex-grow">
            <TextHighlight
              text={currentText}
              isPlaying={isAudioPlaying}
              currentTime={audioCurrentTime}
              duration={audioDuration}
            />
          </div>

          {/* Section Navigation - only show if not in single story audio mode or if no sections */}
          {(story.audio_mode !== 'single_story' ||
            story.sections.length > 1) && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
                aria-label="Previous section"
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft
                  className={
                    storyDirection === 'rtl'
                      ? 'h-5 w-5 rotate-180'
                      : 'h-5 w-5'
                  }
                />
              </Button>

              <span className="px-4 text-sm font-medium text-muted-foreground">
                {currentSectionIndex + 1} / {story.sections.length || 1}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextSection}
                disabled={currentSectionIndex === story.sections.length - 1}
                aria-label="Next section"
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight
                  className={
                    storyDirection === 'rtl'
                      ? 'h-5 w-5 rotate-180'
                      : 'h-5 w-5'
                  }
                />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
