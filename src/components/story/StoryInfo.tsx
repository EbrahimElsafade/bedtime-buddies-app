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

  return (
    <div className="mb-4" dir={currentSectionDir}>
      <div className="mb-2 grid gap-4 text-start">
        <h1 className="text-3xl md:text-4xl">
          {getStoryText('title', 'Untitled Story')}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {story.duration} {t('duration', { lng: currentLanguage })}
          </Badge>
          <Badge variant="secondary">
            {t(`category.${story.category}`, { lng: currentLanguage })}
          </Badge>
          {story.is_free ? (
            <Badge className="bg-green-600 text-secondary">
              {t('type.free', { lng: currentLanguage })}
            </Badge>
          ) : (
            <Badge className="bg-accent text-secondary">
              {t('type.premium', { lng: currentLanguage })}
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
