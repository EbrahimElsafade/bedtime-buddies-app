import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Story, StorySection } from '@/types/story'
import { getAudioUrl } from '@/utils/imageUtils'
import { AutoplayToggle } from './AutoplayToggle'
import { useIsMobile } from '@/hooks/use-mobile'

interface AudioControlsProps {
  story: Story
  currentSection?: StorySection
  currentLanguage: string
  currentSectionIndex: number
  currentSectionDir: 'rtl' | 'ltr'
  onSectionChange?: (index: number) => void
  onPlayingChange?: (isPlaying: boolean) => void
  onAudioTimeUpdate?: (currentTime: number, duration: number) => void
}

export const AudioControls = ({
  story,
  currentSection,
  currentLanguage,
  currentSectionIndex,
  currentSectionDir,
  onSectionChange,
  onPlayingChange,
  onAudioTimeUpdate,
}: AudioControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isAutoplay, setIsAutoplay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const isMobile = useIsMobile()

  // Notify parent component when playing state changes
  useEffect(() => {
    onPlayingChange?.(isPlaying)
  }, [isPlaying, onPlayingChange])

  // Notify parent component when audio time updates
  useEffect(() => {
    onAudioTimeUpdate?.(currentTime, duration)
  }, [currentTime, duration, onAudioTimeUpdate])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)

      if (
        isAutoplay &&
        onSectionChange &&
        currentSectionIndex < story.sections.length - 1
      ) {
        const nextIndex = currentSectionIndex + 1
        onSectionChange(nextIndex)
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
            setIsPlaying(true)
          }
        }, 100)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isAutoplay, onSectionChange, currentSectionIndex, story.sections.length])

  // Reset time when section changes
  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
  }, [currentSectionIndex, currentLanguage])

  const getAudioUrlForCurrentSection = () => {
    if (story.audio_mode === 'single_story' && story.story_audio) {
      return getAudioUrl(story.story_audio[currentLanguage] || null)
    }

    if (currentSection?.voices?.[currentLanguage]) {
      return getAudioUrl(currentSection.voices[currentLanguage])
    }

    return null
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const audioUrl = getAudioUrlForCurrentSection()

  if (!audioUrl) return null

  return (
    <div className="w-full">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration}
          dir={currentSectionDir}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        {/* Time Display - Mobile */}
        {isMobile && (
          <div className="mt-2 flex justify-between text-xs text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`flex items-center ${isMobile ? 'flex-col gap-4' : 'justify-between'}`}>
        <div className={`flex items-center ${isMobile ? 'w-full justify-center' : ''} gap-4`}>
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Volume Control */}
          {!isMobile && (
            <div className="flex items-center gap-2 text-white">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          )}

          {/* Time Display - Desktop */}
          {!isMobile && (
            <div className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          )}
        </div>

        {/* Mobile Volume Controls */}
        {isMobile && (
          <div className="flex w-full items-center justify-center gap-2 text-white">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="flex-1 max-w-48"
            />
          </div>
        )}

        {/* Autoplay Toggle */}
        <div className={`${isMobile ? 'w-full flex justify-center' : ''}`}>
          <AutoplayToggle
            isAutoplay={isAutoplay}
            onAutoplayChange={setIsAutoplay}
            currentSectionDir={currentSectionDir}
          />
        </div>
      </div>
    </div>
  )
}
