import { useLanguage } from '@/contexts/LanguageContext'
import { Story } from '@/types/story'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useTranslation } from 'react-i18next'

interface StoryInfoProps {
  story: Story
  currentLanguageKey: string
  currentSectionDir: 'rtl' | 'ltr'
}

export const StoryInfo = ({
  story,
  currentLanguageKey,
  currentSectionDir,
}: StoryInfoProps) => {
  const { t } = useTranslation('stories')

  const getStoryText = (
    field: keyof Story,
    fallback: string = ''
  ): string => {
    return (
      getMultilingualText(
        story[field] as Record<string, string>,
        currentLanguageKey,
        'en'
      ) || fallback
    )
  }

  return (
    <div className="mb-4" dir={currentSectionDir}>
      <div className="mb-2 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="font-bubbly text-3xl md:text-4xl">{getStoryText('title', 'Untitled Story')}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary/50 px-2 py-1">
            {story.duration} {t('duration')}
          </span>
          <span className="rounded-full bg-secondary/50 px-2 py-1">
            {/* {story.category.charAt(0).toUpperCase() + story.category.slice(1)} */}
            {t(`category.${story.category}`)}
          </span>
          {story.is_free ? (
            <span className="bg-dream-DEFAULT/20 text-dream-DEFAULT rounded-full px-2 py-1 font-medium">
              {t('type.free')}
            </span>
          ) : (
            <span className="bg-moon-DEFAULT/20 rounded-full px-2 py-1 font-medium text-moon-dark">
              {t('type.premium')}
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
