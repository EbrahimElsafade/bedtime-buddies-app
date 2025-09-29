import { Story } from '@/types/story'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useTranslation } from 'react-i18next'

interface StoryInfoProps {
  story: Story
  currentLanguageKey: string
  currentSectionDir: 'rtl' | 'ltr'
  currentLanguage: string
}

export const StoryInfo = ({
  story,
  currentLanguageKey,
  currentSectionDir,
  currentLanguage,
}: StoryInfoProps) => {
  const { t } = useTranslation('stories')

  const getStoryText = (field: keyof Story, fallback: string = ''): string => {
    return (
      getMultilingualText(
        story[field] as Record<string, string>,
        currentLanguageKey,
        'en',
      ) || fallback
    )
  }

  // Map story language codes to i18n language codes for translations
  const getTranslationLanguage = (storyLang: string): string => {
    const langMap: Record<string, string> = {
      en: 'en',
      'ar-eg': 'ar',
      'ar-fos7a': 'ar',
      fr: 'fr',
    }
    return langMap[storyLang] || 'en'
  }

  const translationLang = getTranslationLanguage(currentLanguage)

  return (
    <div className="mb-4" dir={currentSectionDir}>
      <div className="mb-2 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="font-bubbly text-3xl md:text-4xl">
          {getStoryText('title', 'Untitled Story')}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary/50 px-2 py-1">
            {story.duration} {t('duration', { lng: translationLang })}
          </span>
          <span className="rounded-full bg-secondary/50 px-2 py-1">
            {t(`category.${story.category}`, { lng: translationLang })}
          </span>
          {story.is_free ? (
            <span className="bg-primary-foreground/20 text-primary-foreground rounded-full px-2 py-1 font-medium">
              {t('type.free', { lng: translationLang })}
            </span>
          ) : (
            <span className="bg-moon-DEFAULT/20 rounded-full px-2 py-1 font-medium text-moon-dark">
              {t('type.premium', { lng: translationLang })}
            </span>
          )}
        </div>
      </div>

      <p className="mb-4 text-start text-muted-foreground">
        {getStoryText('description', 'No description available')}
      </p>
    </div>
  )
}
