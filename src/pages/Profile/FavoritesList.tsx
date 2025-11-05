import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Heart, Lock } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import { FavoriteItem, FavoriteStory, FavoriteCourse } from '@/types/favorites'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useUserRole } from '@/hooks/useUserRole'

interface FavoritesListProps {
  type: 'story' | 'course'
  favorites: FavoriteItem[]
  language: string
  t: (key: string) => string
}

export const FavoritesList = ({
  type,
  favorites,
  language,
  t,
}: FavoritesListProps) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium } = useUserRole(user)
  const { t: tPremium } = useTranslation('premium')

  const getTitle = (item: FavoriteItem) => {
    if (type === 'story') {
      const story = item as FavoriteStory;
      return typeof story.title === 'object'
        ? story.title[language] || story.title.en || ''
        : ''
    }
    const course = item as FavoriteCourse;
    const langKey = `title_${language}` as keyof FavoriteCourse;
    return (course[langKey] as string) || course.title_en || course.title || ''
  }

  const getDescription = (item: FavoriteItem) => {
    if (type === 'story') {
      const story = item as FavoriteStory;
      return typeof story.description === 'object'
        ? story.description[language] || story.description.en || ''
        : ''
    }
    const course = item as FavoriteCourse;
    const langKey = `description_${language}` as keyof FavoriteCourse;
    return (course[langKey] as string) || course.description_en || course.description || ''
  }

  const emptyMessage =
    type === 'story' ? t('noFavoriteStoriesYet') : t('noFavoriteCoursesYet')
  const browseMessage =
    type === 'story' ? t('browseStories') : t('browseCourses')
  const browsePath = type === 'story' ? '/stories' : '/courses'
  const cardTitle =
    type === 'story' ? t('myFavoriteStories') : t('myFavoriteCourses')
  const cardDescription =
    type === 'story'
      ? t('favoriteStoriesDescription')
      : t('favoriteCoursesDescription')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">{emptyMessage}</p>
            <Button onClick={() => navigate(browsePath)}>
              {browseMessage}
            </Button>
          </div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {favorites.map(item => {
              const title = getTitle(item)
              const description = getDescription(item)
              const imageUrl = getImageUrl(item.cover_image)

              // For courses, show premium message if user is not premium
              if (type === 'course' && !isPremium) {
                return (
                  <Card key={item.id} className="relative overflow-hidden">
                    <CardContent className="p-0">
                      {imageUrl && (
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="h-48 w-full object-cover blur-sm"
                          />
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                            <Lock className="h-12 w-12 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <div className="p-6 text-center">
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium mb-3">
                            {tPremium('tag')}
                          </span>
                          <h4 className="mb-2 text-xl font-bold">{title}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {tPremium('message.description')}
                          </p>
                        </div>
                        <Button 
                          onClick={() => navigate('/subscription')}
                          className="w-full"
                        >
                          {tPremium('message.subscriptionButton')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/${type === 'story' ? 'stories' : 'courses'}/${item.id}`)}
                >
                  <CardContent className="p-4">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="mb-3 h-32 w-full rounded object-cover"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="mb-1 font-medium">{title}</h4>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <Heart className="h-5 w-5 flex-shrink-0 fill-red-500 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
