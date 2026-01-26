import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { logger } from '@/utils/logger'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { getImageUrl } from '@/utils/imageUtils'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useLanguage } from '@/contexts/LanguageContext'

const PopularStories = () => {
  const { t, i18n } = useTranslation(['misc', 'stories', 'common'])
  const { language } = useLanguage()

  const { data: popularStories = [], isLoading } = useQuery({
    queryKey: ['popular-stories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .limit(3)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching popular stories:', error)
        throw error
      }

      return data || []
    },
  })

  if (isLoading) {
    return (
      <section className="relative overflow-hidden px-4 py-12">
        <div className="container mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-bubbly text-2xl text-primary-foreground md:text-3xl">
              {t('stories:popular')}
            </h2>
            <Link
              to="/stories"
              className="flex items-center text-sm font-medium text-primary-foreground hover:underline"
            >
              {t('misc:free.viewAll')}{' '}
              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map(i => (
              <Card
                key={i}
                className="story-card h-[25rem] w-full animate-pulse overflow-hidden border-primary/20 bg-secondary/70 pb-4 backdrop-blur-sm"
              >
                <div className="h-48 bg-gray-200"></div>
                <CardHeader className="pb-2">
                  <div className="mb-2 h-6 rounded bg-gray-200"></div>
                  <div className="mb-1 h-4 rounded bg-gray-200"></div>
                  <div className="h-4 rounded bg-gray-200"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden px-4 py-12">
      <div className="container mx-auto">
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h2 className="font-bubbly text-lg text-primary-foreground md:text-3xl">
            {t('stories:popular')}
          </h2>
          <Link
            to="/stories"
            className="flex items-center text-xs font-medium text-primary-foreground hover:underline md:text-sm"
          >
            {t('misc:free.viewAll')}{' '}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {popularStories.map(story => {
            const imageUrl = getImageUrl(story.cover_image)
            const storyTitle = getMultilingualText(
              story.title,
              i18n.language,
              'en',
            )
            const storyDescription = getMultilingualText(
              story.description,
              i18n.language,
              'en',
            )

            return (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card className="story-card relative z-20 flex h-[25rem] w-full cursor-pointer flex-col overflow-hidden border-primary/20 bg-secondary/10 pb-4 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={storyTitle}
                        className="h-full w-full object-cover"
                        onError={e => {
                          logger.debug(
                            'Popular story image failed to load:',
                            story.cover_image,
                          )
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-gray-500">{t('common:noImage')}</span>
                      </div>
                    )}
                    {story.is_free ? (
                      <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-green-600 px-3 py-1.5 text-xs font-bold text-secondary shadow-lg">
                        {t('misc:free.tag')}
                      </div>
                    ) : (
                      <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                        {t('misc:premium.tag')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <CardHeader className="flex-1 pb-2">
                      <div className="mb-2 flex items-start justify-between">
                        <CardTitle className="line-clamp-2 flex-1 text-lg text-primary-foreground">
                          {storyTitle}
                        </CardTitle>
                        <div className="ml-2 flex items-center gap-1 md:gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary/30 text-xs text-primary-foreground"
                          >
                            {t(`stories:category.${story.category}`, {
                              defaultValue:
                                story.category.charAt(0).toUpperCase() +
                                story.category.slice(1),
                            })}
                          </Badge>
                          <p className="flex items-center gap-1 text-xs text-primary-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {story.duration} {t('misc:duration')}
                            </span>
                          </p>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed text-primary-foreground">
                        {storyDescription}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Fun decorative elements specific to this section */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="opacity-10"
        >
          <path
            fill="#7dd3fc"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default PopularStories
