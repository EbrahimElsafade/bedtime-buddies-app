import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Story } from '@/types/story'

export const useStoryLanguage = (story: Story | undefined) => {
  const [currentLanguage, setCurrentLanguage] = useState<
    'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  >('ar-fos7a')

  const { profile } = useAuth()

  useEffect(() => {
    if (story) {
      // Set preferred language if available - with proper type checking
      const preferredLang = profile?.preferred_language
      if (
        preferredLang &&
        (preferredLang === 'en' ||
          preferredLang === 'ar-eg' ||
          preferredLang === 'ar-fos7a' ||
          preferredLang === 'fr') &&
        story.languages.includes(preferredLang)
      ) {
        setCurrentLanguage(preferredLang)
      } else if (story.languages.length > 0) {
        // Ensure the first language is one of our supported types
        const firstLang = story.languages[0]
        if (
          firstLang === 'en' ||
          firstLang === 'ar-eg' ||
          firstLang === 'ar-fos7a' ||
          firstLang === 'fr'
        ) {
          setCurrentLanguage(firstLang)
        }
      }
    }
  }, [story, profile])

  return { currentLanguage, setCurrentLanguage }
}
