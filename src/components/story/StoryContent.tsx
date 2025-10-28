import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Story } from '@/types/story'
import { getImageUrl } from '@/utils/imageUtils'
import { AudioControls } from './AudioControls'
import { TextHighlight } from './TextHighlight'
import VideoPlayer from './VideoPlayer'
import { useEffect, useRef, useState } from 'react'

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
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const currentSection = story.sections[currentSectionIndex]
  const currentText =
    currentSection?.texts[currentLanguage] ||
    'Content not available in selected language'

  const currentVideo = currentSection?.video
    ? currentSection.video
    : null

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
    
    // Sync video with audio time if video exists
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime
    }
  }
  
  // Update video playback state when audio playing state changes
  useEffect(() => {
    if (videoRef.current) {
      if (isAudioPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error)
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isAudioPlaying])

  return (
    <Card
      dir={storyDirection}
      className="mb-4 overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm md:mb-6"
    >
      <div className="grid">
        {/* Story Section Video or Image */}
        <div className="relative w-full">
          {currentVideo ? (
            <div className="aspect-square h-64 w-full md:aspect-auto md:h-auto">
              <VideoPlayer
                videoPath={currentVideo}
                title={storyTitle}
                className="h-full w-full object-cover"
                playOnTouch={!(story.audio_mode === 'single_story' || (currentSection?.voices && Object.keys(currentSection.voices).length > 0))}
                onVideoRef={(ref) => {
                  videoRef.current = ref
                }}
              />
            </div>
          ) : currentImage ? (
            <img
              src={currentImage}
              alt={storyTitle}
              className="aspect-square h-64 w-full object-cover md:aspect-auto md:h-full"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex aspect-square h-64 w-full items-center justify-center bg-muted md:aspect-auto md:h-full">
              <span className="text-muted-foreground">No media</span>
            </div>
          )}

          <div className="absolute bottom-0 w-full bg-black/50">
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
        </div>

        {/* Section Navigation - only show if not in single story audio mode or if no sections */}
        {(story.audio_mode !== 'single_story' || story.sections.length > 1) && (
          <div className="flex items-center justify-between p-4 md:p-6 pb-0">
            <Button
              size="icon"
              variant='ghost'
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              aria-label="Previous section"
              className="h-8 w-8 md:h-10 md:w-10 shadow-lg"
            >
              <ChevronLeft
                className={
                  storyDirection === 'rtl'
                    ? 'h-4 w-4 rotate-180 md:h-5 md:w-5'
                    : 'h-4 w-4 md:h-5 md:w-5'
                }
              />
            </Button>

            <span className="px-2 text-xs text-muted-foreground md:text-sm">
              {currentSectionIndex + 1} / {story.sections.length || 1}
            </span>

            <Button
              size="icon"
              variant='ghost'
              onClick={handleNextSection}
              disabled={currentSectionIndex === story.sections.length - 1}
              aria-label="Next section"
              className="h-8 w-8 md:h-10 md:w-10 shadow-lg"
            >
              <ChevronRight
                className={
                  storyDirection === 'rtl'
                    ? 'h-4 w-4 rotate-180 md:h-5 md:w-5'
                    : 'h-4 w-4 md:h-5 md:w-5'
                }
              />
            </Button>
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
        </div>
      </div>
    </Card>
  )
}
