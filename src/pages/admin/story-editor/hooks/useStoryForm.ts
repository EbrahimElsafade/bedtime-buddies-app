import { useState, useCallback } from 'react'

export interface StorySectionForm {
  id?: string
  order: number
  texts: Record<string, string>
  voices: Record<string, string>
  image?: string
  imageFile?: File | null
  imagePreview?: string | null
  voiceFiles?: Record<string, File>
  voicePreviews?: Record<string, string>
}

export interface StoryFormData {
  title: Record<string, string>
  description: Record<string, string>
  category: string
  duration: number
  is_free: boolean
  is_published: boolean
  languages: string[]
  cover_image: string | null
  audio_mode: 'per_section' | 'single_story'
  story_audio: Record<string, string>
}

export const useStoryForm = () => {
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>({})
  const [storyAudioPreviews, setStoryAudioPreviews] = useState<Record<string, string>>({})
  
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: { en: '', ar: '', fr: '' },
    description: { en: '', ar: '', fr: '' },
    category: '',
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ['en'],
    cover_image: null,
    audio_mode: 'per_section',
    story_audio: {},
  })

  const [storySections, setStorySections] = useState<StorySectionForm[]>([])

  const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImageFile(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }, [])

  const handleStoryAudioChange = useCallback((language: string, file: File) => {
    setStoryAudioFiles(prev => ({ ...prev, [language]: file }))
    setStoryAudioPreviews(prev => ({
      ...prev,
      [language]: URL.createObjectURL(file),
    }))
  }, [])

  const handleRemoveStoryAudio = useCallback((language: string) => {
    setStoryAudioFiles(prev => {
      const updated = { ...prev }
      delete updated[language]
      return updated
    })
    setStoryAudioPreviews(prev => {
      const updated = { ...prev }
      delete updated[language]
      return updated
    })
    setStoryData(prev => ({
      ...prev,
      story_audio: {
        ...prev.story_audio,
        [language]: '',
      },
    }))
  }, [])

  return {
    storyData,
    setStoryData,
    storySections,
    setStorySections,
    coverImageFile,
    setCoverImageFile,
    coverImagePreview,
    setCoverImagePreview,
    storyAudioFiles,
    setStoryAudioFiles,
    storyAudioPreviews,
    setStoryAudioPreviews,
    handleCoverImageChange,
    handleStoryAudioChange,
    handleRemoveStoryAudio,
  }
}
