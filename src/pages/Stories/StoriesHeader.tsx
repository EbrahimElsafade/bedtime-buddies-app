import { useTranslation } from 'react-i18next'

export const StoriesHeader = () => {
  const { t } = useTranslation('stories')

  return (
    <div className="mb-4 text-center md:mb-6 lg:mb-8">
      <h1 className="mb-2 text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
        {t('allStories')}
      </h1>
    </div>
  )
}
