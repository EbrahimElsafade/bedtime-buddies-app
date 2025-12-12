import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useCourseData, useCourseCategories } from '@/hooks/useCourseData'
import { useCourseFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { useTranslation } from 'react-i18next'
import { CourseHeader } from '@/components/course/CourseHeader'
import { useUserRole } from '@/hooks/useUserRole'
import { getCategoryText } from '@/utils/courseUtils'

const Course = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()

  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const { data: categories = [] } = useCourseCategories()
  const { isFavorite, addFavorite, removeFavorite } = useCourseFavorites()
  const { isPremium } = useUserRole(user)
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'

  // Compute category from course data
  const category = course
    ? categories.find(
        cat => cat.id === course.category || cat.name === course.category,
      )
    : null

  useEffect(() => {
    setIsLoading(isLoading)
    if (isLoading) {
      setLoadingMessage(t('loading.course', { ns: 'common' }))
    }
  }, [isLoading, setIsLoading, setLoadingMessage, t])

  useEffect(() => {
    if (course) {
      document.title = `${getLocalized(course, 'title', lang)} | Dolphoon`
    } else {
      document.title = 'Course Not Found | Dolphoon'
    }
  }, [course, lang])

  const handleStartCourse = () => {
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired'),
        description: t('toast.pleaseLoginToStart'),
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    if (!isPremium) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: 'destructive',
      })
      return
    }

    // Navigate to the lessons page
    navigate(`/courses/${courseId}/lessons`)
  }

  // Redirect to login if not authenticated (but wait while auth is loading)
  if (!isAuthenticated && !authLoading) {
    navigate('/login')
    return null
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="mb-6 font-bubbly text-3xl text-primary-foreground">
          {t('course.error')}
        </h1>
        <p className="mb-8 text-primary-foreground">{t('course.errorDesc')}</p>
        <Link to="/courses">
          <Button
            variant="outline"
            className="border-primary-foreground text-primary-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
          </Button>
        </Link>
      </div>
    )
  }

  // Course not found state
  if (!course) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="mb-6 font-bubbly text-3xl text-primary-foreground">
          {t('course.notFound')}
        </h1>
        <p className="mb-8 text-primary-foreground">
          {t('course.notFoundDesc')}
        </p>
        <Link to="/courses">
          <Button
            variant="outline"
            className="border-primary-foreground text-primary-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <Helmet>
        <title>
          {getLocalized(course, 'title', lang)} - {t('meta:name')}
        </title>
        <meta
          name="description"
          content={getLocalized(course, 'description', lang)}
        />
        <meta
          property="og:title"
          content={`${getLocalized(course, 'title', lang)} - ${t('meta:name')}`}
        />
        <meta
          property="og:description"
          content={getLocalized(course, 'description', lang)}
        />
        <meta property="og:type" content="article" />
        {course.coverImagePath && (
          <meta
            property="og:image"
            content={getImageUrl(course.coverImagePath)}
          />
        )}
      </Helmet>

      {/* Decorative background elements */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-float rounded-full bg-primary/10"></div>
      <div
        className="bg-moon-light/10 absolute bottom-20 right-10 h-16 w-16 animate-float rounded-full"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="container mx-auto">
        <CourseHeader
          onBackClick={() => navigate('/courses')}
          isFavorite={courseId ? isFavorite(courseId) : false}
          onToggleFavorite={() => {
            if (courseId) {
              if (isFavorite(courseId)) {
                removeFavorite(courseId)
              } else {
                addFavorite(courseId)
              }
            }
          }}
          courseTitle={getLocalized(course, 'title', lang)}
          courseDescription={getLocalized(course, 'description', lang)}
        />

        <div className="grid">
          {/* Course Header */}
          <div className="flex flex-col items-start gap-4 md:flex-row">
            <div className="my-auto md:w-1/3">
              <Card className="overflow-hidden border-primary/30">
                <img
                  src={getImageUrl(course.coverImagePath)}
                  alt={getLocalized(course, 'title', lang)}
                  className="aspect-[4/3] h-auto w-full object-fill"
                />
              </Card>
            </div>

            <div className="grid gap-4 md:w-2/3">
              <h1 className="font-bubbly text-3xl text-primary-foreground md:text-4xl">
                {getLocalized(course, 'title', lang)}
              </h1>

              <div className="flex max-w-60 flex-wrap gap-2 sm:max-w-none">
                <Badge variant="secondary" className="px-4 py-2 shadow-md">
                  {getCategoryText(category, 'name', lang) ||
                    course.category ||
                    'General'}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 shadow-md">
                  {course.minAge}-{course.maxAge} {t('courses.years')}
                </Badge>

                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2 shadow-md"
                >
                  <Clock className="size-4" />
                  <span>
                    {Math.floor(course.duration / 60)} {t('duration')}
                  </span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2 shadow-md"
                >
                  <BookOpen className="size-4" />
                  <span>
                    {course.lessons} {t('courses.lessons')}
                  </span>
                </Badge>
              </div>

              <p className="text-primary-foreground">
                {getLocalized(course, 'description', lang)}
              </p>

              {course.instructor && (
                <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="grid gap-4">
                  <h2 className="font-bubbly text-xl text-primary-foreground">
                    {t('course.instructor')}
                  </h2>

                  <div className="flex items-start gap-4">
                    {course.instructor.avatar && (
                      <img
                        src={course.instructor.avatar}
                        alt={getLocalized(course.instructor, 'name', lang)}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-primary-foreground">
                        {getLocalized(course.instructor, 'name', lang)}
                      </h3>
                      <p className="mt-1 text-sm text-primary-foreground/80">
                        {getLocalized(course.instructor, 'bio', lang)}
                      </p>
                      {(() => {
                        const expertise = getLocalized(
                          course.instructor,
                          'expertise',
                          lang,
                        )
                        return (
                          Array.isArray(expertise) &&
                          expertise.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {expertise.map((skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={handleStartCourse}>
                  {t('button.startLearning')}
                </Button>

                <Button variant="secondary">
                  {t('button.communicateWithASpecialist')}
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Section */}

          {(() => {
            const objectives =
              ((course as Record<string, unknown>)[
                `learning_objectives_${lang}`
              ] as string[]) ||
              course.learningObjectives ||
              []
            return (
              objectives &&
              (objectives as string[]).length > 0 && (
                <>
                  <h2 className="mb-3 mt-6 font-bubbly text-xl text-primary-foreground">
                    {t('course.whatYouLearn')}
                  </h2>
                  <ul
                    className="list-decimal ps-5"
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {(objectives as string[]).map(
                      (objective: string, index: number) => (
                        <li key={index}>{objective}</li>
                      ),
                    )}
                  </ul>
                </>
              )
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default Course
