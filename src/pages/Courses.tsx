import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { courses, Course } from '@/data/courses'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses)
  const [activeCategory, setActiveCategory] = useState<
    Course['category'] | 'all'
  >('all')
  const { t } = useLanguage()

  useEffect(() => {
    document.title = 'Bedtime Stories - Learn with Courses'

    const filtered = courses.filter(
      course =>
        (activeCategory === 'all' || course.category === activeCategory) &&
        (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    setFilteredCourses(filtered)
  }, [searchQuery, activeCategory])

  const handleCategoryChange = (category: Course['category'] | 'all') => {
    setActiveCategory(category)
  }

  const getAgeCounts = () => {
    const counts: Record<string, number> = {}
    courses.forEach(course => {
      if (!counts[course.ageRange]) {
        counts[course.ageRange] = 0
      }
      counts[course.ageRange]++
    })
    return counts
  }

  const ageCounts = getAgeCounts()

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
                  <Button
                    variant={
                      activeCategory === 'language' ? 'default' : 'ghost'
                    }
                    className={`${activeCategory === 'language' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('language')}
                  >
                    {t('courses.categories.language')} (
                    {courses.filter(c => c.category === 'language').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'math' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'math' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('math')}
                  >
                    {t('courses.categories.math')} (
                    {courses.filter(c => c.category === 'math').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'science' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'science' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('science')}
                  >
                    {t('courses.categories.science')} (
                    {courses.filter(c => c.category === 'science').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'arts' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'arts' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('arts')}
                  >
                    {t('courses.categories.arts')} (
                    {courses.filter(c => c.category === 'arts').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'social' ? 'default' : 'ghost'}
                    className={`${activeCategory === 'social' ? 'bg-dream-DEFAULT text-white' : 'text-dream-DEFAULT'} h-8 justify-start px-2 text-xs md:h-9 md:px-3 md:text-sm`}
                    onClick={() => handleCategoryChange('social')}
                  >
                    {t('courses.categories.social')} (
                    {courses.filter(c => c.category === 'social').length})
                  </Button>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
                {filteredCourses.map(course => (
                  <Card
                    key={course.id}
                    className="story-card overflow-hidden border-dream-light/20 bg-white/70 backdrop-blur-sm transition-all hover:shadow-lg dark:bg-nightsky-light/70"
                  >
                    <div className="relative aspect-[3/2]">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="text-dream-DEFAULT absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs dark:bg-nightsky-light/80">
                        {course.ageRange} {t('courses.years')}
                      </div>
                      {course.isFree ? (
                        <div className="bg-dream-DEFAULT absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium text-white">
                          {t('free.tag')}
                        </div>
                      ) : (
                        <div className="bg-moon-DEFAULT absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium text-white">
                          {t('premium.tag')}
                        </div>
                      )}
                    </div>
                    <CardHeader className="px-3 pb-2 pt-3 md:px-6 md:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-dream-DEFAULT line-clamp-2 flex-1 text-base md:text-xl">
                          {course.title}
                        </CardTitle>
                        <Badge className="text-dream-DEFAULT shrink-0 border-none bg-dream-light/30 text-xs">
                          {course.category.charAt(0).toUpperCase() +
                            course.category.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-dream-DEFAULT line-clamp-2 text-sm dark:text-foreground">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 pb-2 md:px-6">
                      <div className="text-dream-DEFAULT flex items-center justify-between text-xs dark:text-foreground md:text-sm">
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                          <span>
                            {course.lessons} {t('courses.lessons')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>
                            {course.duration} {t('duration')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-3 pt-2 md:px-6 md:pt-6">
                      <Link to={`/courses/${course.id}`} className="w-full">
                        <Button
                          className={cn(
                            'h-8 w-full text-xs md:h-9 md:text-sm',
                            course.isFree
                              ? 'bg-dream-DEFAULT text-white hover:bg-dream-dark dark:text-white'
                              : 'bg-moon-DEFAULT text-dream-DEFAULT hover:bg-moon-dark dark:text-white',
                          )}
                        >
                          {course.isFree
                            ? t('button.startLearning')
                            : t('button.premium')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
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
