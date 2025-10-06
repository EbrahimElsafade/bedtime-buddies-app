import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/integrations/supabase/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '@/utils/imageUtils'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useLanguage } from '@/contexts/LanguageContext'
import { StoriesHeader } from './Stories/StoriesHeader'
import { StoriesFilters } from './Stories/StoriesFilters'

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { t, i18n } = useTranslation(['stories', 'misc', 'meta'])
  const { language } = useLanguage()

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stories:', error)
        throw error
      }

      return data || []
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }

      return data || []
    },
  })

  const filteredStories = stories.filter(story => {
    const storyTitle = getMultilingualText(story.title, i18n.language, 'en')
    const storyDescription = getMultilingualText(
      story.description,
      i18n.language,
      'en',
    )

    const matchesSearch =
      searchTerm === '' ||
      storyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storyDescription.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || story.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="px-3 py-4 md:px-4 md:py-8 lg:py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 text-center md:mb-6 lg:mb-8">
            <h1 className="mb-2 bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
              {t('allStories')}
            </h1>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-[20rem] animate-pulse">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader>
                  <div className="mb-2 h-6 rounded bg-gray-200"></div>
                  <div className="h-4 rounded bg-gray-200"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12">
      <Helmet>
        <title>{t('meta:titles.stories')}</title>
        <meta name="description" content={t('meta:descriptions.stories')} />
        <meta property="og:title" content={t('meta:titles.stories')} />
        <meta property="og:description" content={t('meta:descriptions.stories')} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        <StoriesHeader />
        
        <StoriesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="py-8 text-center md:py-12">
            <p className="text-sm text-muted-foreground md:text-base">
              {searchTerm || selectedCategory !== 'all'
                ? t('noStoriesFound')
                : t('noStoriesAvailable')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {filteredStories.map(story => {
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
                  <Card className="story-card flex h-80 min-w-80 max-w-96 cursor-pointer flex-col overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm transition-shadow hover:shadow-lg md:h-96">
                    <div className="relative h-56">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={storyTitle}
                          className="aspect-[3/2] h-56 w-full object-fill"
                          onError={e => {
                            console.log(
                              'Story image failed to load:',
                              story.cover_image,
                            )
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-sm text-gray-500">
                            No Image
                          </span>
                        </div>
                      )}
                      {story.is_free ? (
                        <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-green-600 px-3 py-1.5 text-xs font-bold text-secondary shadow-lg">
                          {t('free.tag', { ns: 'misc' })}
                        </div>
                      ) : (
                        <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                          {t('premium.tag', { ns: 'misc' })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3 md:p-4">
                      <CardHeader className="flex-1 p-0 pb-2">
                        <div className="mb-2 flex items-start justify-between">
                          <CardTitle className="line-clamp-1 flex-1 text-sm text-primary-foreground md:text-base lg:text-lg">
                            {storyTitle}
                          </CardTitle>
                          <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-primary/30 text-xs text-primary-foreground"
                            >
                              {t(`category.${story.category}`, {
                                defaultValue:
                                  story.category.charAt(0).toUpperCase() +
                                  story.category.slice(1),
                              })}
                            </Badge>
                            <div className="flex items-center text-xs text-primary-foreground">
                              <Clock className="mx-1 h-3 w-3" />
                              <span>
                                {t('duration', { duration: story.duration })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 text-xs leading-relaxed text-primary-foreground md:text-sm">
                          {storyDescription}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stories
