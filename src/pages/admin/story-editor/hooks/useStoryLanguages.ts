import { useCallback } from 'react'
import { StorySectionForm, StoryFormData } from './useStoryForm'

export const useStoryLanguages = (
  storyData: StoryFormData,
  setStoryData: React.Dispatch<React.SetStateAction<StoryFormData>>,
  storySections: StorySectionForm[],
  setStorySections: React.Dispatch<React.SetStateAction<StorySectionForm[]>>
) => {
  const handleAddLanguage = useCallback((language: string) => {
    if (!storyData.languages.includes(language)) {
      const updatedLanguages = [...storyData.languages, language]
      const updatedStoryAudio = { ...storyData.story_audio, [language]: '' }

      setStoryData(prev => ({
        ...prev,
        languages: updatedLanguages,
        story_audio: updatedStoryAudio,
      }))

      const updatedSections = storySections.map(section => ({
        ...section,
        texts: {
          ...section.texts,
          [language]: '',
        },
        voices: {
          ...section.voices,
          [language]: '',
        },
      }))
      setStorySections(updatedSections)
    }
  }, [storyData.languages, storyData.story_audio, storySections, setStoryData, setStorySections])

  const handleRemoveLanguage = useCallback((language: string) => {
    const updatedLanguages = storyData.languages.filter(lang => lang !== language)
    const updatedStoryAudio = { ...storyData.story_audio }
    delete updatedStoryAudio[language]

    setStoryData(prev => ({
      ...prev,
      languages: updatedLanguages,
      story_audio: updatedStoryAudio,
    }))

    const updatedSections = storySections.map(section => {
      const newTexts = { ...section.texts }
      const newVoices = { ...section.voices }
      delete newTexts[language]
      delete newVoices[language]

      return {
        ...section,
        texts: newTexts,
        voices: newVoices,
      }
    })
    setStorySections(updatedSections)
  }, [storyData.languages, storyData.story_audio, storySections, setStoryData, setStorySections])

  return {
    handleAddLanguage,
    handleRemoveLanguage,
  }
}
