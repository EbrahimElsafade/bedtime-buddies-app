import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
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

const FeaturedStories = () => {
  const { t, i18n } = useTranslation(['misc', 'stories'])
  const { language } = useLanguage()

  // Map website language to story language codes
  const getStoryLanguageCode = (websiteLanguage: string) => {
    switch (websiteLanguage) {
      case 'ar':
        return 'ar-eg' // Default to Egyptian Arabic for Arabic website language
      case 'en':
        return 'en'
      case 'fr':
        return 'fr'
      default:
        return 'en'
    }
  }

  const currentStoryLanguage = getStoryLanguageCode(language)

  const { data: featuredStories = [], isLoading } = useQuery({
    queryKey: ['featured-stories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .limit(3)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching featured stories:', error)
        throw error
      }

      console.log('data:', data)

      return data || []
    },
  })

  const handleViewAllClick = e => {
    console.log('View All Stories button clicked in FeaturedStories')
    // Don't prevent default - let Link handle navigation
  }

  const handleStoryClick = (storyId: string) => {
    console.log('Story card clicked, navigating to:', `/stories/${storyId}`)
  }

  if (isLoading) {
    return (
      <section className="relative bg-secondary/50 px-4 py-8 md:py-12">
        <div className="container mx-auto">
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center md:mb-6">
            <h2 className="text-dream-DEFAULT font-bubbly text-xl md:text-2xl lg:text-3xl">
              {t('stories:featured.title')}
            </h2>
            <Link
              to="/stories"
              className="text-dream-DEFAULT flex items-center text-sm font-medium hover:text-dream-dark"
            >
              {t('misc:free.viewAll')}{' '}
              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card
                key={i}
                className="story-card w-full h-80 animate-pulse overflow-hidden border-dream-light/20 bg-white/70 pb-4 backdrop-blur-sm dark:bg-nightsky-light/70 md:h-96 lg:h-[25rem]"
              >
                <div className="h-40 bg-gray-200 md:h-48"></div>
                <CardHeader className="px-3 pb-2 md:px-6">
                  <div className="mb-2 h-5 rounded bg-gray-200 md:h-6"></div>
                  <div className="mb-1 h-3 rounded bg-gray-200 md:h-4"></div>
                  <div className="h-3 rounded bg-gray-200 md:h-4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Fun decorative elements for stories section */}
        <div className="absolute start-0 top-0 w-full overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="opacity-10"
          >
            <path
              fill="#8B5CF6"
              fillOpacity="1"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-secondary/50 px-4 py-8 md:py-12">
      <div className="container mx-auto">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center md:mb-6">
          <h2 className="text-dream-DEFAULT font-bubbly text-xl md:text-2xl lg:text-3xl">
            {t('stories:featured.title')}
          </h2>
          <Link
            to="/stories"
            className="text-dream-DEFAULT flex shrink-0 items-center text-sm font-medium hover:text-dream-dark"
            onClick={handleViewAllClick}
          >
            {t('misc:free.viewAll')}{' '}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid relative z-40 grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {featuredStories.map(story => {
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
              <Link 
                key={story.id} 
                to={`/stories/${story.id}`}
                onClick={() => handleStoryClick(story.id)}
                className="block"
              >
                <Card className="story-card flex w-full h-80 cursor-pointer flex-col overflow-hidden border-dream-light/20 bg-white/70 pb-4 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02] dark:bg-nightsky-light/70 md:h-96 lg:h-[25rem]">
                  <div className="relative h-40 overflow-hidden md:h-48">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={storyTitle}
                        className="h-full w-full object-cover"
                        onError={e => {
                          console.log(
                            'Featured story image failed to load:',
                            story.cover_image,
                          )
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-sm text-gray-500">No Image</span>
                      </div>
                    )}
                    {story.is_free ? (
                      <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-green-600 px-2 py-1 text-xs font-bold text-white shadow-lg md:px-3 md:py-1.5 pointer-events-none">
                        {t('misc:free.tag')}
                      </div>
                    ) : (
                      <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-lg md:px-3 md:py-1.5 pointer-events-none">
                        {t('misc:premium.tag')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <CardHeader className="flex-1 px-3 pb-2 pt-3 md:px-6 md:pt-6">
                      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <CardTitle className="text-dream-DEFAULT line-clamp-2 flex-1 text-base md:text-lg">
                          {storyTitle}
                        </CardTitle>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-dream-DEFAULT bg-dream-light/30 text-xs pointer-events-none"
                          >
                            {t(`stories:category.${story.category}`, {
                              defaultValue:
                                story.category.charAt(0).toUpperCase() +
                                story.category.slice(1),
                            })}
                          </Badge>
                          <div className="text-dream-DEFAULT flex items-center gap-1 text-xs pointer-events-none">
                            <Clock className="h-3 w-3" />
                            <span>
                              {story.duration} {t('misc:duration')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-dream-DEFAULT line-clamp-2 text-sm leading-relaxed dark:text-foreground">
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

      {/* Fun decorative elements for stories section */}
      <div className="absolute left-0 top-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="opacity-10"
        >
          <path
            fill="#8B5CF6"
            fillOpacity="1"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default FeaturedStories
