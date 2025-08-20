import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Story, StorySection } from '@/types/story'
import { getAudioUrl } from '@/utils/imageUtils'
import { AutoplayToggle } from './AutoplayToggle'

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

      // Autoplay logic: move to next section if autoplay is enabled
      if (
        isAutoplay &&
        onSectionChange &&
        currentSectionIndex < story.sections.length - 1
      ) {
        const nextIndex = currentSectionIndex + 1
        onSectionChange(nextIndex)
        // Small delay to ensure section change is processed before playing
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
    <div>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="space-y-4">
        <Slider
          value={[currentTime]}
          max={duration}
          dir={currentSectionDir}
          step={1}
          onValueChange={handleSeek}
          className="w-full [&>span]:h-1 [&>span]:rounded-none [&>span]:last:[&>span]:-mt-1.5 [&>span]:last:[&>span]:hidden [&>span]:hover:h-2 [&>span]:last:[&>span]:hover:block"
        />
      </div>

      <div className=" ">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10 rounded-full text-white hover:translate-y-0 hover:bg-transparent/10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="hidden items-center gap-4 space-x-2 text-white sm:flex">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>

            <div className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="px-4 text-white">
            <AutoplayToggle
              isAutoplay={isAutoplay}
              onAutoplayChange={setIsAutoplay}
              currentSectionDir={currentSectionDir}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
