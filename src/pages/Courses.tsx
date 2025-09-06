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
import { Skeleton } from '@/components/ui/skeleton'
import { useCourses, type CourseFromDB } from '@/hooks/useCourses'
import { useLanguage } from '@/hooks/useLanguage'

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')
  const { t } = useLanguage()
  const { data: courses = [], isLoading, error } = useCourses()

  useEffect(() => {
    document.title = 'Bedtime Stories - Learn with Courses'
  }, [])

  const filteredCourses = useMemo(() => {
    if (!courses) return []
    
    return courses.filter(
      course =>
        (activeCategory === 'all' || course.category === activeCategory) &&
        (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [courses, activeCategory, searchQuery])

  const handleCategoryChange = (category: string | 'all') => {
    setActiveCategory(category)
  }

  const categoryCounts = useMemo(() => {
    if (!courses) return {}
    
    const counts: Record<string, number> = {}
    courses.forEach(course => {
      if (!counts[course.category]) {
        counts[course.category] = 0
      }
      counts[course.category]++
    })
    return counts
  }, [courses])

  if (isLoading) {
    return (
      <div className="relative px-3 py-8 md:px-4 md:py-12">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[25rem] w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative px-3 py-8 md:px-4 md:py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <p className="text-dream-DEFAULT text-lg">
              {t('courses.errorLoading')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative px-3 py-8 md:px-4 md:py-12">
      {/* Fun decorative elements */}
      <div className="absolute left-10 top-20 hidden h-20 w-20 animate-float rounded-full bg-dream-light/10 md:block"></div>
      <div
        className="absolute bottom-20 right-10 hidden h-16 w-16 animate-float rounded-full bg-moon-light/10 md:block"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="container mx-auto max-w-7xl">
        <h1 className="text-dream-DEFAULT mb-4 font-bubbly text-2xl md:mb-6 md:text-3xl lg:text-4xl">
          {t('courses.exploreTitle')}
        </h1>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white/80 p-4 backdrop-blur-sm dark:bg-nightsky-light/80 md:p-6">
              <h3 className="text-dream-DEFAULT mb-3 font-bubbly text-lg md:mb-4 md:text-xl">
                {t('courses.allCourses')}
              </h3>

              {/* Search */}
              <div className="relative mb-4 md:mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('courses.searchPlaceholder')}
                  className="pl-10 text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-dream-DEFAULT mb-2 text-sm font-medium md:text-base">
                  {t('courses.categories.language')}
                </h4>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'all' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    {t('courses.allCourses')} ({courses.length})
                  </Button>
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? 'default' : 'ghost'}
                      className={`${activeCategory === category ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="text-dream-DEFAULT mb-2 text-sm font-medium md:text-base">
                  {t('courses.languages')}
                </h4>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <Badge
                    variant="outline"
                    className="border-dream-light bg-dream-light/20 text-xs"
                  >
                    English ({courses.length})
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {filteredCourses.length === 0 ? (
              <div className="rounded-lg bg-white/70 py-8 text-center dark:bg-nightsky-light/70 md:py-12">
                <p className="text-dream-DEFAULT text-base md:text-lg">
                  {t('courses.noResults')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                  >
                    <Card className="story-card relative z-20 flex h-[25rem] w-full cursor-pointer flex-col overflow-hidden border-dream-light/20 bg-white/10 pb-4 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-nightsky-light/10">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.cover_image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={e => {
                            console.log(
                              'Course image failed to load:',
                              course.cover_image,
                            )
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {course.is_free ? (
                          <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            {t('free.tag')}
                          </div>
                        ) : (
                          <div className="absolute end-2 top-2 rounded-full border-2 border-white bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                            {t('premium.tag')}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <CardHeader className="flex-1 pb-2">
                          <div className="mb-2 flex items-start justify-between">
                            <CardTitle className="text-dream-DEFAULT line-clamp-2 flex-1 text-lg">
                              {course.title}
                            </CardTitle>
                            <div className="ml-2 flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-dream-DEFAULT bg-dream-light/30 text-xs"
                              >
                                {course.category.charAt(0).toUpperCase() +
                                  course.category.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription className="text-dream-DEFAULT line-clamp-2 text-sm leading-relaxed dark:text-foreground">
                            {course.description}
                          </CardDescription>
                          <div className="text-dream-DEFAULT mt-2 flex items-center text-xs dark:text-foreground">
                            <BookOpen className="mr-1 h-3 w-3" />
                            <span>
                              {course.languages.join(', ')} • Published {new Date(course.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardHeader>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Courses
