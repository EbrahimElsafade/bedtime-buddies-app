import { Story } from '@/types/story'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/badge'

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
          <Badge variant="secondary">
            {story.duration} {t('duration', { lng: translationLang })}
          </Badge>
          <Badge variant="secondary">
            {t(`category.${story.category}`, { lng: translationLang })}
          </Badge>
          {story.is_free ? (
            <Badge className="bg-green-600 text-background">
              {t('type.free', { lng: translationLang })}
            </Badge>
          ) : (
            <Badge className="bg-accent text-background">
              {t('type.premium', { lng: translationLang })}
            </Badge>
          )}
        </div>
      </div>

      <p className="mb-4 text-start text-muted-foreground">
        {getStoryText('description', 'No description available')}
      </p>
    </div>
  )
}
