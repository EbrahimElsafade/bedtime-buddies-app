import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'
import { useFeaturedCourses, useCourseCategories } from '@/hooks/useCourseData'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { getCategoryText } from '@/utils/courseUtils'

const FeaturedCourses = () => {
  const { t } = useTranslation(['misc', 'stories', 'premium', 'courses'])
  const { data: featuredCourses = [], isLoading } = useFeaturedCourses()
  const { data: categories = [] } = useCourseCategories()
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (isLoading || !featuredCourses.length) return null

  return (
    <section className="relative bg-background/70 px-4 py-12">
      <div className="container mx-auto">
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h2 className="text-lg text-primary-foreground md:text-3xl">
            {t('misc:courses.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredCourses.map(course => {
            const category = categories.find(
              cat => cat.id === course.category || cat.name === course.category,
            )

            // Show login overlay for non-authenticated users
            if (!isAuthenticated) {
              return (
                <div
                  key={course.id}
                  onClick={() => navigate('/login')}
                  className="cursor-pointer"
                >
                  <Card className="story-card relative z-10 h-[500px] overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm">
                    <div className="relative aspect-[3/2]">
                      <img
                        src={getImageUrl(course.coverImagePath)}
                        alt={getLocalized(course, 'title', lang)}
                        className="h-full w-full overflow-hidden object-cover"
                        onError={e => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                      <h3 className="mb-2 line-clamp-1 font-bubbly text-lg text-primary-foreground">
                        {getLocalized(course, 'title', lang)}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Please log in to view courses
                      </p>
                      <Button className="w-full">Log In</Button>
                    </div>
                  </Card>
                </div>
              )
            }

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="block"
              >
                <Card className="story-card relative z-10 h-[500px] cursor-pointer overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="relative aspect-[3/2]">
                    <img
                      src={getImageUrl(course.coverImagePath)}
                      alt={getLocalized(course, 'title', lang)}
                      className="h-full w-full overflow-hidden object-cover"
                      onError={e => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'
                      }}
                    />
                    <div className="absolute right-2 top-2 rounded-full bg-secondary/80 px-2 py-1 text-xs text-primary-foreground shadow-md">
                      {course.minAge}-{course.maxAge} {t('misc:courses.years')}
                    </div>
                    {course.is_free && (
                      <Badge className="absolute left-2 top-2 bg-green-500 hover:bg-green-600">
                        {t('courses:free.tag')}
                      </Badge>
                    )}
                    {!course.is_free && (
                      <Badge className="absolute left-2 top-2 bg-gradient-to-r from-purple-500 to-pink-500">
                        {t('premium:tag')}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="h-28 pb-2">
                    <CardTitle className="text-xl text-primary-foreground">
                      {getLocalized(course, 'title', lang)}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-primary-foreground">
                      {getLocalized(course, 'description', lang)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary/30 text-primary-foreground"
                      >
                        {getCategoryText(category, 'name', lang) ||
                          course.category ||
                          'General'}
                      </Badge>
                    </div>
                    {course.instructor && (
                      <div className="mb-3 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={course.instructor.avatar ? getImageUrl(course.instructor.avatar) : undefined} 
                            alt={getLocalized(course.instructor, 'name', lang)}
                          />
                          <AvatarFallback className="bg-primary/20 text-xs text-primary-foreground">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-primary-foreground">
                          {getLocalized(course.instructor, 'name', lang)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-primary-foreground">
                      <div className="flex items-center gap-2">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>
                          {course.lessons} {t('misc:courses.lessons')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>
                          {Math.floor(course.duration / 60)}{' '}
                          {t('misc:duration')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <Link to="/courses">
            <Button variant="accent">{t('misc:free.viewAll')}</Button>
          </Link>
        </div>
      </div>

      {/* top Fun decorative elements for courses section */}
      <div className="absolute left-0 top-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="opacity-10"
        >
          <path
            fill="#7dd3fc"
            fillOpacity="1"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* bottom Fun decorative elements specific to this section */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full">
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

export default FeaturedCourses
