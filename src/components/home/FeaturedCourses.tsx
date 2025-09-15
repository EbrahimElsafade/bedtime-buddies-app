import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useFeaturedCourses, useCourseCategories } from '@/hooks/useCourseData'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'

const FeaturedCourses = () => {
  const { t } = useTranslation(['misc', 'stories'])
  const { data: featuredCourses = [], isLoading } = useFeaturedCourses()
  const { data: categories = [] } = useCourseCategories()
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'

  if (isLoading || !featuredCourses.length) return null

  return (
    <section className="relative bg-secondary/50 px-4 py-12">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-dream-DEFAULT font-bubbly text-2xl md:text-3xl">
            {t('misc:courses.title')}
          </h2>
          <Link
            to="/courses"
            className="text-dream-DEFAULT flex items-center text-sm font-medium hover:text-dream-dark"
          >
            {t('misc:free.viewAll')}{' '}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredCourses.map(course => {
            const category = categories.find(cat => cat.id === course.category)
            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="block"
              >
                <Card className="story-card cursor-pointer overflow-hidden border-dream-light/20 bg-white/70 backdrop-blur-sm transition-transform hover:scale-105 dark:bg-nightsky-light/70">
                  <div className="relative aspect-[3/2]">
                    <img
                      src={getImageUrl(course.coverImagePath)}
                      alt={getLocalized(course, 'title', lang)}
                      className="h-full w-full object-cover"
                      onError={e => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'
                      }}
                    />
                    {course.isFree ? (
                      <div className="bg-dream-DEFAULT absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium text-white">
                        {t('misc:free.tag')}
                      </div>
                    ) : (
                      <div className="bg-moon-DEFAULT absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium text-white">
                        {t('misc:premium.tag')}
                      </div>
                    )}
                    <div className="text-dream-DEFAULT absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs dark:bg-nightsky-light/80">
                      {course.minAge}-{course.maxAge} {t('misc:courses.years')}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-dream-DEFAULT text-xl">
                      {getLocalized(course, 'title', lang)}
                    </CardTitle>
                    <CardDescription className="text-dream-DEFAULT line-clamp-2 dark:text-foreground">
                      {getLocalized(course, 'description', lang)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="text-dream-DEFAULT bg-dream-light/30"
                      >
                        {getLocalized(category, 'name', lang) || 'General'}
                      </Badge>
                    </div>
                    <div className="text-dream-DEFAULT flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>
                          {course.lessons} {t('misc:courses.lessons')}
                        </span>
                      </div>
                      <div className="flex items-center">
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
      </div>

      {/* Fun decorative elements for courses section */}
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

export default FeaturedCourses
