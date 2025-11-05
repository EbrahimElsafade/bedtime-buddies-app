import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, BookOpen, Play, Lock } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CourseVideo } from '@/types/course'
import { useCourseData } from '@/hooks/useCourseData'
import { useCourseFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import HLSVideoPlayer from '@/components/course/HLSVideoPlayer'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { useTranslation } from 'react-i18next'
import { CourseHeader } from '@/components/course/CourseHeader'

const Course = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)

  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const { isFavorite, addFavorite, removeFavorite } = useCourseFavorites()
  const isPremium = profile?.is_premium || false
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'

  useEffect(() => {
    setIsLoading(isLoading)
    if (isLoading) {
      setLoadingMessage(t('loading.course', { ns: 'common' }))
    }
  }, [isLoading, setIsLoading, setLoadingMessage, t])

  const tabsRef = useRef<HTMLDivElement>(null)

  const scrollToTabs = () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (tabsRef.current) {
          tabsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      })
    })
  }

  useEffect(() => {
    if (course) {
      document.title = `${getLocalized(course, 'title', lang)} | Dolphoon`
      // Set the first video as selected by default if there are videos
      if (course.videos && course.videos.length > 0) {
        setSelectedVideo(course.videos[0])
      }
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

    // If authentication and premium check passes, we would start the course
    toast({
      title: t('toast.courseStarted'),
      description: `${t('toast.enjoyLearning')} ${getLocalized(course, 'title', lang)}!`,
    })

    // Select first video and switch to content tab
    if (course?.videos && course.videos.length > 0) {
      setSelectedVideo(course.videos[0])
      setActiveTab('content')
      scrollToTabs()
    }
  }

  const handleVideoSelect = (video: CourseVideo) => {
    if (!isPremium) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: 'destructive',
      })
      return
    }
    setSelectedVideo(video)
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

        <div className="grid grid-cols-1 gap-8">
          {/* Course Header */}
          <div className="flex flex-col items-start gap-8 md:flex-row">
            <div className="md:w-1/3">
              <Card className="overflow-hidden border-primary/30">
                <img
                  src={getImageUrl(course.coverImagePath)}
                  alt={getLocalized(course, 'title', lang)}
                  className="aspect-[4/3] h-auto w-full object-cover"
                />
              </Card>
            </div>

            <div className="md:w-2/3">
              <h1 className="mb-4 font-bubbly text-3xl text-primary-foreground md:text-4xl">
                {getLocalized(course, 'title', lang)}
              </h1>

              <div className="mb-4 flex max-w-60 flex-wrap gap-2 sm:max-w-none">
                <Badge variant="secondary" className="px-4 py-2 shadow-md">
                  {course.category || 'General'}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 shadow-md">
                  {course.minAge}-{course.maxAge} {t('courses.years')}
                </Badge>

                <Badge
                  variant="secondary"
                  className="flex items-center px-4 py-2 shadow-md"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {Math.floor(course.duration / 60)} {t('duration')}
                  </span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center px-4 py-2 shadow-md"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>
                    {course.lessons} {t('courses.lessons')}
                  </span>
                </Badge>
              </div>

              <p className="mb-6 text-primary-foreground">
                {getLocalized(course, 'description', lang)}
              </p>

              <Button
                onClick={handleStartCourse}
                className="rounded-full bg-accent px-8 py-2 text-secondary hover:bg-primary"
              >
                {isAuthenticated && isPremium
                  ? t('button.startLearning')
                  : t('button.goToPremium')}
              </Button>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs
            ref={tabsRef}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-8">
              <TabsTrigger value="overview">{t('course.overview')}</TabsTrigger>
              <TabsTrigger value="content">{t('course.content')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="prose prose-dream mb-8 max-w-none text-primary-foreground">
                <h2 className="mb-3 font-bubbly text-xl text-primary-foreground">
                  {t('course.about')}
                </h2>
                <p>{getLocalized(course, 'description', lang)}</p>

                {(() => {
                  const objectives =
                    (course as any)[`learning_objectives_${lang}`] ||
                    course.learningObjectives ||
                    []
                  return (
                    objectives &&
                    objectives.length > 0 && (
                      <>
                        <h2 className="mb-3 mt-6 font-bubbly text-xl text-primary-foreground">
                          {t('course.whatYouLearn')}
                        </h2>
                        <ul
                          className="list-decimal ps-5"
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        >
                          {objectives.map(
                            (objective: string, index: number) => (
                              <li key={index}>{objective}</li>
                            ),
                          )}
                        </ul>
                      </>
                    )
                  )
                })()}

                {course.instructor && (
                  <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <h2 className="mb-3 mt-6 font-bubbly text-xl text-primary-foreground">
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
                                {expertise.map(
                                  (skill: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-8">
              <div className="flex flex-col gap-8 lg:flex-row rtl:lg:flex-row-reverse">
                {/* Video Player */}
                <div className="lg:flex-[2]">
                  {selectedVideo ? (
                    <div className="space-y-4">
                      <div className="aspect-video overflow-hidden rounded-lg bg-black">
                        {selectedVideo.videoPath ? (
                          <HLSVideoPlayer
                            videoPath={selectedVideo.videoPath}
                            title={getLocalized(selectedVideo, 'title', lang)}
                            className="rounded-lg"
                          />
                        ) : selectedVideo.videoPath ? (
                          // Fallback for URL-based videos (if you still want to support them)
                          <iframe
                            src={selectedVideo.videoPath}
                            title={getLocalized(selectedVideo, 'title', lang)}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="flex h-full items-center justify-center text-secondary">
                            <p>No video source available</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="mb-2 font-bubbly text-xl text-primary-foreground">
                          {getLocalized(selectedVideo, 'title', lang)}
                        </h3>
                        <div className="mb-2 flex items-center text-sm text-primary-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>
                            {Math.floor(selectedVideo.duration / 60)}:{String(selectedVideo.duration % 60).padStart(2, '0')} {t('duration')}
                          </span>
                        </div>
                        <p className="text-primary-foreground">
                          {getLocalized(selectedVideo, 'description', lang)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary">
                      <p className="text-center text-muted-foreground">
                        {t('course.selectVideo')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Video List */}
                <div className="lg:flex-1">
                  <h3 className="mb-4 font-bubbly text-xl text-primary-foreground">
                    {t('course.courseVideos')}
                  </h3>

                  <div className="space-y-3">
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map(video => (
                        <Card
                          key={video.id}
                          className={cn(
                            'cursor-pointer transition-all hover:border-primary-foreground',
                            selectedVideo?.id === video.id &&
                              'border-primary-foreground',
                          )}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="relative h-16 w-24 flex-shrink-0">
                                <img
                                  src={getImageUrl(video.thumbnailPath)}
                                  alt={getLocalized(video, 'title', lang)}
                                  className="h-full w-full rounded object-cover"
                                />
                                {!isPremium && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50">
                                    <Lock className="h-6 w-6 text-secondary" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground">
                                    <Play className="h-4 w-4 text-secondary" />
                                  </div>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-medium text-primary-foreground">
                                  {getLocalized(video, 'title', lang)}
                                </h4>
                                <div className="mt-1 flex items-center text-xs text-primary-foreground/70">
                                  <Clock className="mx-1 h-3 w-3" />
                                  <span>
                                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="py-4 text-center text-muted-foreground">
                        {t('course.noVideos')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Course
