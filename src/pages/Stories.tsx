import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '@/utils/imageUtils'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { useLanguage } from '@/contexts/LanguageContext'

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { t, i18n } = useTranslation(['common', 'stories'])
  const { language } = useLanguage()

  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t(
      'stories',
      { ns: 'navigation' },
    )}`
  }, [t])

  const isRTL = i18n.language === 'ar'

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

      console.log('data', data)

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
      <div
        className="px-3 py-4 md:px-4 md:py-8 lg:py-12"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 text-center md:mb-6 lg:mb-8">
            <h1 className="from-dream-DEFAULT mb-2 bg-gradient-to-r to-purple-600 bg-clip-text text-xl font-bold leading-tight text-transparent md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
              {t('stories:allStories')}
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
    <div
      className="px-3 py-4 md:px-4 md:py-8 lg:py-12"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="from-dream-DEFAULT mb-2 bg-gradient-to-r to-purple-600 bg-clip-text text-xl font-bold leading-tight text-transparent md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('stories:allStories')}
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-xs text-muted-foreground md:text-sm lg:text-base">
            {t('stories:browseCollection')}
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 space-y-3 md:mb-6 md:space-y-4 lg:mb-8">
          <div className="relative mx-auto max-w-md">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground ${
                isRTL ? 'right-3' : 'left-3'
              }`}
            />
            <Input
              type="text"
              placeholder={t('stories:searchStories')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full ${
                isRTL ? 'pr-10 text-right' : 'pl-10'
              } py-2 text-sm md:text-base`}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm"
            >
              {t('stories:allCategories')}
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.name ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm"
              >
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="py-8 text-center md:py-12">
            <p className="text-sm text-muted-foreground md:text-base">
              {searchTerm || selectedCategory !== 'all'
                ? t('stories:noStoriesFound')
                : t('stories:noStoriesAvailable')}
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
                  <Card className="story-card flex h-80 bg-red-500 min-w-80 max-w-96 cursor-pointer flex-col overflow-hidden border-dream-light/20 bg-white/70 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-nightsky-light/70 md:h-96">
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
                        <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                          {t('misc:free.tag')}
                        </div>
                      ) : (
                        <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                          {t('misc:premium.tag')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3 md:p-4">
                      <CardHeader className="flex-1 p-0 pb-2">
                        <div className="mb-2 flex items-start justify-between">
                          <CardTitle className="text-dream-DEFAULT line-clamp-2 flex-1 text-sm md:text-base lg:text-lg">
                            {storyTitle}
                          </CardTitle>
                          <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-dream-DEFAULT bg-dream-light/30 text-xs"
                            >
                              {story.category.charAt(0).toUpperCase() +
                                story.category.slice(1)}
                            </Badge>
                            <div className="text-dream-DEFAULT flex items-center text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                {story.duration} {t('misc:duration')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-dream-DEFAULT line-clamp-2 text-xs leading-relaxed dark:text-foreground md:text-sm">
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
