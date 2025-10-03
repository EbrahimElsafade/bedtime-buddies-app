import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { getImageUrl } from '@/utils/imageUtils'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { Badge } from '../ui/badge'

interface HomePageSettings {
  freeStory: string
  freeStoryEnabled: boolean
  storiesSection: boolean
  topRated: boolean
  courses: boolean
  specialStory: boolean
}

const FreeStory = () => {
  const { t, i18n } = useTranslation(['misc', 'stories'])

  // Fetch home page settings to get the selected free story
  const { data: settings } = useQuery({
    queryKey: ['appearance-settings', 'home_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('setting_value')
        .eq('setting_key', 'home_page')
        .maybeSingle()

      if (error) throw error
      return data?.setting_value as unknown as HomePageSettings
    },
  })

  // Fetch the selected free story details
  const { data: freeStory, isLoading } = useQuery({
    queryKey: ['free-story', settings?.freeStory],
    queryFn: async () => {
      if (!settings?.freeStory) return null

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', settings.freeStory)
        .eq('is_published', true)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!settings?.freeStory && !!settings?.freeStoryEnabled,
  })

  // Don't render if the free story section is disabled, loading, or no story selected
  if (
    !settings?.freeStoryEnabled ||
    isLoading ||
    !settings?.freeStory ||
    !freeStory
  )
    return null

  const coverImage = freeStory.cover_image
    ? getImageUrl(freeStory.cover_image)
    : '/placeholder.svg'
  const storyTitle = getMultilingualText(freeStory.title, i18n.language, 'en')
  const storyDescription = getMultilingualText(
    freeStory.description,
    i18n.language,
    'en',
  )

  return (
    <section className="px-4 py-12">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg text-primary-foreground md:text-3xl">
            {t('misc:free.story')}
          </h2>
          <Link
            to="/stories"
            className="flex items-center text-xs font-medium text-primary-foreground hover:underline md:text-sm"
          >
            {t('misc:free.viewAll')}{' '}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <Link to={`/stories/${freeStory.id}`}>
          <Card className="story-card border-moon-light/50 cursor-pointer overflow-hidden border-2 bg-secondary/50 backdrop-blur-sm transition-shadow hover:shadow-lg">
            <div className="md:flex">
              <div className="relative h-64 overflow-hidden md:h-64 md:w-1/3">
                <img
                  src={coverImage}
                  alt={storyTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <CardTitle className="mb-2 text-xl text-primary-foreground md:text-2xl">
                  {storyTitle}
                </CardTitle>
                <CardDescription className="mb-4 text-primary-foreground">
                  {storyDescription}
                </CardDescription>
                <div className="flex items-center text-sm text-primary-foreground">
                  <Badge variant="secondary" className='gap-2'>
                    <Clock className="h-3 w-3" />
                    {freeStory.duration} {t('stories:duration')}
                  </Badge>

                  {freeStory.languages.map((lang: string) => (
                    <Badge key={lang}  className="mx-1">
                      {t(`lang.${lang}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  )
}

export default FreeStory
