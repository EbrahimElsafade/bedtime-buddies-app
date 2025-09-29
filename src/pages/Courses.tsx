import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCoursesData, useCourseCategories } from '@/hooks/useCourseData'
import { useLanguage } from '@/contexts/LanguageContext'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { getCategoryText } from '@/utils/courseUtils'

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { t } = useLanguage()
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'

  const { data: courses = [], isLoading } = useCoursesData()
  const { data: categories = [] } = useCourseCategories()

  useEffect(() => {
    document.title = 'Bedtime Stories - Learn with Courses'
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const categoryMatch =
        activeCategory === 'all' || course.category === activeCategory
      const searchMatch =
        getLocalized(course, 'title', lang)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getLocalized(course, 'description', lang)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [courses, activeCategory, lang, searchQuery])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const ageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    courses.forEach(course => {
      const ageRange = `${course.minAge}-${course.maxAge}`
      if (!counts[ageRange]) {
        counts[ageRange] = 0
      }
      counts[ageRange]++
    })
    return counts
  }, [courses])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-primary-foreground">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-8 md:px-4 md:py-12">
      {/* Fun decorative elements */}
      <div className="absolute left-10 top-20 hidden h-20 w-20 animate-float rounded-full bg-primary/10 md:block"></div>
      <div
        className="bg-moon-light/10 absolute bottom-20 right-10 hidden h-16 w-16 animate-float rounded-full md:block"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="container mx-auto max-w-7xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 font-bubbly text-2xl leading-tight text-primary-foreground md:mb-3 md:text-3xl lg:mb-4 lg:text-4xl">
            {t('courses.exploreTitle')}
          </h1>
        </div>

        {/* Controls - match Stories page layout */}
        <div className="mb-4 space-y-3 md:mb-6 md:space-y-4 lg:mb-8">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('courses.searchPlaceholder')}
              className="pl-10 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button
              variant={activeCategory === 'all' ? 'accent' : 'tertiary'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm"
            >
              {t('courses.allCourses')}
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={
                  activeCategory === category.name ? 'accent' : 'tertiary'
                }
                size="sm"
                onClick={() => handleCategoryChange(category.name)}
                className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm"
              >
                {getCategoryText(category, 'name', lang)}
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-lg bg-secondary/70 py-8 text-center md:py-12">
            <p className="text-base text-primary-foreground md:text-lg">
              {t('courses.noResults')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map(course => {
              const category = categories.find(
                cat =>
                  cat.id === course.category || cat.name === course.category,
              )
              return (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="story-card relative z-20 flex h-[25rem] w-full cursor-pointer flex-col overflow-hidden border-primary/20 bg-secondary/10 pb-4 backdrop-blur-sm transition-shadow hover:shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(course.coverImagePath)}
                        alt={getLocalized(course, 'title', lang)}
                        className="h-full w-full object-cover"
                        onError={e => {
                          console.log(
                            'Course image failed to load:',
                            course.coverImagePath,
                          )
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'
                        }}
                      />
                      {course.isFree ? (
                        <Badge className="absolute end-2 top-2 border-none bg-green-600 text-secondary">
                          {t('free.tag')}
                        </Badge>
                      ) : (
                        <Badge className="absolute end-2 top-2 bg-accent text-secondary">
                          {t('premium.tag')}
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <CardHeader className="px-4 pt-4 ">
                        <CardTitle className="line-clamp-2 flex-1 text-lg text-primary-foreground">
                          {getLocalized(course, 'title', lang)}
                        </CardTitle>

                        <div className="grid grid-cols-2 gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary/30 text-xs text-primary-foreground"
                          >
                            {category
                              ? getCategoryText(category, 'name', lang)
                              : 'General'}
                          </Badge>

                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2 bg-primary/30 text-xs text-primary-foreground"
                          >
                            <Clock className="h-3 w-3" />
                            <span>
                              {Math.floor(course.duration / 60)} {t('duration')}
                            </span>
                          </Badge>

                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2 bg-primary/30 text-xs text-primary-foreground"
                          >
                            <BookOpen className="mr-1 h-3 w-3" />
                            <span>
                              {course.lessons} {t('courses.lessons')}
                            </span>
                          </Badge>

                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2 bg-primary/30 text-xs text-primary-foreground"
                          >
                            <BookOpen className="mr-1 h-3 w-3" />
                            <span>
                              {course.minAge}-{course.maxAge}{' '}
                              {t('courses.years')}
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardDescription className="line-clamp-2 px-4 text-sm leading-relaxed text-primary-foreground">
                        {getLocalized(course, 'description', lang)}
                      </CardDescription>
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

export default Courses
