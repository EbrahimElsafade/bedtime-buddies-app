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

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { t } = useLanguage()

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
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [searchQuery, activeCategory, courses])

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
        <div className="text-dream-DEFAULT">Loading courses...</div>
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
                  Categories
                </h4>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'all' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    {t('courses.allCourses')} ({courses.length})
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={
                        activeCategory === category.name ? 'default' : 'ghost'
                      }
                      className={`${activeCategory === category.name ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      {category.name} (
                      {courses.filter(c => c.category === category.name).length}
                      )
                    </Button>
                  ))}
                </div>
              </div>

              {/* Age Range Filters */}
              <div>
                <h4 className="text-dream-DEFAULT mb-2 text-sm font-medium md:text-base">
                  {t('courses.years')}
                </h4>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {Object.entries(ageCounts).map(([age, count]) => (
                    <Badge
                      key={age}
                      variant="outline"
                      className="border-dream-light bg-dream-light/20 text-xs"
                    >
                      {age} {t('courses.years')} ({count})
                    </Badge>
                  ))}
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
                {filteredCourses.map(course => {
                  const category = categories.find(
                    cat => cat.id === course.category,
                  )
                  return (
                    <Link key={course.id} to={`/courses/${course.id}`}>
                      <Card className="story-card relative z-20 flex h-[25rem] w-full cursor-pointer flex-col overflow-hidden border-dream-light/20 bg-white/10 pb-4 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-nightsky-light/10">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={getImageUrl(course.coverImagePath)}
                            alt={course.title}
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
                                  {category?.name || 'General'}
                                </Badge>
                                <div className="text-dream-DEFAULT flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {Math.floor(course.duration / 60)}{' '}
                                    {t('duration')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <CardDescription className="text-dream-DEFAULT line-clamp-2 text-sm leading-relaxed dark:text-foreground">
                              {course.description}
                            </CardDescription>
                            <div className="text-dream-DEFAULT mt-2 flex items-center text-xs dark:text-foreground">
                              <BookOpen className="mr-1 h-3 w-3" />
                              <span>
                                {course.lessons} {t('courses.lessons')} •{' '}
                                {course.minAge}-{course.maxAge}{' '}
                                {t('courses.years')}
                              </span>
                            </div>
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
      </div>
    </div>
  )
}

export default Courses
