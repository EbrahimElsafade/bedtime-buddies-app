import { useCallback } from 'react'
import { StorySectionForm, StoryFormData } from './useStoryForm'

export const useStorySections = (
  storyData: StoryFormData,
  storySections: StorySectionForm[],
  setStorySections: React.Dispatch<React.SetStateAction<StorySectionForm[]>>
) => {
  const addNewSection = useCallback(() => {
    const newSection: StorySectionForm = {
      order: storySections.length + 1,
      texts: storyData.languages.reduce((acc, lang) => {
        acc[lang] = ''
        return acc
      }, {} as Record<string, string>),
      voices: storyData.languages.reduce((acc, lang) => {
        acc[lang] = ''
        return acc
      }, {} as Record<string, string>),
      imagePreview: null,
    }

    setStorySections(prev => [...prev, newSection])
  }, [storyData.languages, storySections.length, setStorySections])

  const deleteSection = useCallback((index: number) => {
    setStorySections(prev => prev.filter((_, i) => i !== index))
  }, [setStorySections])

  const handleSectionImageChange = useCallback((sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setStorySections(prev => {
        const updated = [...prev]
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
        }
        return updated
      })
    }
  }, [setStorySections])

  const handleClearSectionImage = useCallback((sectionIndex: number) => {
    setStorySections(prev => {
      const updated = [...prev]
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        imageFile: null,
        imagePreview: null,
        image: undefined,
      }
      return updated
    })
  }, [setStorySections])

  const handleSectionVideoChange = useCallback((sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setStorySections(prev => {
        const updated = [...prev]
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          videoFile: file,
          videoPreview: URL.createObjectURL(file),
        }
        return updated
      })
    }
  }, [setStorySections])

  const handleClearSectionVideo = useCallback((sectionIndex: number) => {
    setStorySections(prev => {
      const updated = [...prev]
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        videoFile: null,
        videoPreview: null,
        video: undefined,
      }
      return updated
    })
  }, [setStorySections])

  const handleSectionVoiceChange = useCallback((sectionIndex: number, language: string, file: File) => {
    setStorySections(prev => {
      const updated = [...prev]
      const section = updated[sectionIndex]
      updated[sectionIndex] = {
        ...section,
        voiceFiles: { ...(section.voiceFiles || {}), [language]: file },
        voicePreviews: {
          ...(section.voicePreviews || {}),
          [language]: URL.createObjectURL(file),
        },
      }
      return updated
    })
  }, [setStorySections])

  const handleRemoveSectionVoice = useCallback((sectionIndex: number, language: string) => {
    setStorySections(prev => {
      const updated = [...prev]
      const section = updated[sectionIndex]
      const newVoiceFiles = { ...(section.voiceFiles || {}) }
      const newVoicePreviews = { ...(section.voicePreviews || {}) }
      delete newVoiceFiles[language]
      delete newVoicePreviews[language]

      updated[sectionIndex] = {
        ...section,
        voiceFiles: newVoiceFiles,
        voicePreviews: newVoicePreviews,
        voices: { ...section.voices, [language]: '' },
      }
      return updated
    })
  }, [setStorySections])

  const updateSectionText = useCallback((sectionIndex: number, language: string, text: string) => {
    setStorySections(prev => {
      const updated = [...prev]
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        texts: {
          ...updated[sectionIndex].texts,
          [language]: text,
        },
      }
      return updated
    })
  }, [setStorySections])

  return {
    addNewSection,
    deleteSection,
    handleSectionImageChange,
    handleClearSectionImage,
    handleSectionVideoChange,
    handleClearSectionVideo,
    handleSectionVoiceChange,
    handleRemoveSectionVoice,
    updateSectionText,
  }
}
