import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Story, StorySection } from '@/types/story'
import { getAudioUrl } from '@/utils/imageUtils'
import { useTranslation } from 'react-i18next'

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

// SVG Icons
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    height="24px"
    width="24px"
    className="fill-secondary"
  >
    <path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z" />
  </svg>
)

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    height="24px"
    width="24px"
    className="fill-secondary"
  >
    <path d="m380-300 280-180-280-180v360ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
  </svg>
)

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
  const { t } = useTranslation('story')

  // Notify parent component when playing state changes
  useEffect(() => {
    onPlayingChange?.(isPlaying)
  }, [isPlaying, onPlayingChange])

  // Notify parent component when audio time updates
  useEffect(() => {
    onAudioTimeUpdate?.(currentTime, duration)
  }, [currentTime, duration, onAudioTimeUpdate])

  // Helper function to update duration from audio element
  const updateDuration = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Reset duration when audio source changes
    setDuration(0)

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      // Ensure duration is set if not already
      if (duration === 0) {
        updateDuration()
      }
    }

    const handleLoadedMetadata = () => {
      updateDuration()
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
  }, [isAutoplay, onSectionChange, currentSectionIndex, story.sections.length, duration])

  // Reset time when section changes
  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
  }, [currentSectionIndex, currentLanguage])

  const getAudioUrlForCurrentSection = () => {
    if (story.audio_mode === 'single_story' && story.story_audio) {
      const url = getAudioUrl(story.story_audio[currentLanguage] || null)
      return url
    }

    if (currentSection?.voices?.[currentLanguage]) {
      return getAudioUrl(currentSection.voices[currentLanguage])
    }

    return null
  }
  const toggleAutoplay = async () => {
    const audio = audioRef.current
    if (!audio) return

    // If currently playing, stop playback (toggle off)
    if (!audio.paused) {
      stopAudio()
      audio.pause()
      onPlayingChange?.(false)
      return
    }

    // Start autoplay (advance on end)
    setIsPlaying(true)
    setIsAutoplay(true)
    onPlayingChange?.(true)

    try {
      // Wait for audio to actually start playing before proceeding
      await audio.play()
    } catch (error) {
      setIsPlaying(false)
      setIsAutoplay(false)
      onPlayingChange?.(false)
    }
  }

  const toggleIsPlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    // If currently playing, stop playback (toggle off)
    if (!audio.paused) {
      stopAudio()
      audio.pause()
      onPlayingChange?.(false)
      return
    }

    // Start normal playback (no auto-advance)
    setIsAutoplay(false)
    setIsPlaying(true)
    onPlayingChange?.(true)

    try {
      await audio.play()
    } catch (error) {
      setIsPlaying(false)
      onPlayingChange?.(false)
    }
  }

  const stopAudio = () => {
    if (isPlaying) setIsPlaying(false)
    if (isAutoplay) setIsAutoplay(false)
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

      <div className="flex items-center justify-between pe-4">
        <div className="flex items-center justify-between">
          <Button
            variant="link"
            onClick={toggleAutoplay}
            aria-pressed={isPlaying && isAutoplay}
            className={`flex justify-between rounded-none border-e border-secondary px-2 text-secondary ${
              isPlaying && isAutoplay ? 'bg-accent' : 'text-secondary'
            }`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}

            {isPlaying ? t('story:stopVideo') : t('story:playVideo')}
          </Button>

          <Button
            variant="link"
            onClick={toggleIsPlay}
            aria-pressed={isPlaying && !isAutoplay}
            className={`flex justify-between rounded-none border-e border-secondary px-2 text-secondary ${
              isPlaying && !isAutoplay ? 'bg-accent' : 'text-secondary'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}

            {isPlaying ? t('story:stopStory') : t('story:readStory')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-4 space-x-2 text-secondary sm:flex">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          <div className="flex gap-2 text-sm text-secondary">
            <span> {formatTime(currentTime)} </span>
            <span> / </span>
            <span> {formatTime(duration)} </span>
          </div>
        </div>
      </div>
    </div>
  )
}
