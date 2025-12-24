import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, BookOpen, Clock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { Input } from '@/components/ui/input'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCoursesData, useCourseCategories } from '@/hooks/useCourseData'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { getCategoryText } from '@/utils/courseUtils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Get filters from URL
  const searchQuery = searchParams.get('search') || ''
  const activeCategory = searchParams.get('category') || 'all'

  const { t } = useTranslation(['courses', 'meta', 'common', 'premium'])
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isPremium } = useUserRole(user)

  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: courses = [], isLoading } = useCoursesData()
  const { data: categories = [] } = useCourseCategories()

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('search', value)
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const handleCategoryChange = (category: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (category && category !== 'all') {
      newParams.set('category', category)
    } else {
      newParams.delete('category')
    }
    setSearchParams(newParams)
  }

  useEffect(() => {
    setIsLoading(isLoading)
    setLoadingMessage(isLoading ? t('common:loading.courses') : undefined)
  }, [isLoading, setIsLoading, setLoadingMessage, t])

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

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-8 md:px-4 md:py-12">
      <Helmet>
        <title>{t('meta:titles.courses')}</title>
        <meta name="description" content={t('meta:descriptions.courses')} />
        <meta property="og:title" content={t('meta:titles.courses')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.courses')}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Fun decorative elements */}

      <div className="container mx-auto max-w-7xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('courses.exploreTitle')}
          </h1>
        </div>

        {/* Controls - match Stories page layout */}
        <div className="mb-4 space-y-3 md:mb-6 md:space-y-4 lg:mb-8">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={handleCategoryChange}
            value={activeCategory}
          >
            <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto p-1 md:mb-6 lg:mb-8">
              <TabsTrigger value="all">{t('courses.allCourses')}</TabsTrigger>

              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.name}>
                  {getCategoryText(category, 'name', lang)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                type="search"
                placeholder={t('courses.searchPlaceholder')}
                className="w-full py-2 ps-10 text-start text-sm md:text-base"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>

            {/* <div className="flex w-full flex-wrap justify-between gap-4 rounded-lg px-4 py-2 lg:max-w-md">
              <Badge>the</Badge>
              <Badge>age</Badge>
              <Badge>filters</Badge>
              <Badge>well</Badge>
              <Badge>be</Badge>
              <Badge>here</Badge>
            </div> */}
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

              // Show login overlay for non-authenticated users (use homepage card style)
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
                          {t('courses.loginToView')}
                        </p>
                        <Button className="w-full">{t('common:login')}</Button>
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
                  <Card className="story-card relative z-10 grid cursor-pointer gap-4 overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm transition-transform hover:scale-105">
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
                      <div className="absolute right-2 top-2 rounded-full bg-secondary/80 px-2 text-xs text-primary-foreground shadow-md">
                        {course.minAge}-{course.maxAge}{' '}
                        {t('misc:courses.years')}
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

                    <CardHeader className="grid gap-4 py-0">
                      <CardTitle className="text-xl text-primary-foreground">
                        {getLocalized(course, 'title', lang)}
                      </CardTitle>

                      <CardDescription className="line-clamp-2 text-primary-foreground">
                        {getLocalized(course, 'description', lang)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {course.instructor && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={
                                  course.instructor.avatar
                                    ? getImageUrl(course.instructor.avatar)
                                    : undefined
                                }
                                alt={getLocalized(
                                  course.instructor,
                                  'name',
                                  lang,
                                )}
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

                        <Badge
                          variant="secondary"
                          className="bg-primary/30 text-primary-foreground"
                        >
                          {getCategoryText(category, 'name', lang) ||
                            course.category ||
                            'General'}
                        </Badge>
                      </div>

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
        )}
      </div>
    </div>
  )
}

export default Courses
