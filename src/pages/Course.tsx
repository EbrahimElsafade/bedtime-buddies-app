import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Play,
  Lock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CourseVideo } from '@/types/course'
import { useCourseData } from '@/hooks/useCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import HLSVideoPlayer from '@/components/course/HLSVideoPlayer'

const Course = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const { isAuthenticated, profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)

  const { data: course, isLoading, error } = useCourseData(courseId)
  const isPremium = profile?.is_premium || false

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
      document.title = `${course.title} | Bedtime Stories`
      // Set the first video as selected by default if there are videos
      if (course.videos && course.videos.length > 0) {
        setSelectedVideo(course.videos[0])
      }
    } else {
      document.title = 'Course Not Found | Bedtime Stories'
    }
  }, [course])

  const handleStartCourse = () => {
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired'),
        description: t('toast.pleaseLoginToStart'),
        variant: 'destructive',
      })
      return
    }

    if (!course?.isFree && !isPremium) {
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
      description: `${t('toast.enjoyLearning')} ${course?.title}!`,
    })

    // Select first video and switch to content tab
    if (course?.videos && course.videos.length > 0) {
      setSelectedVideo(course.videos[0])
      setActiveTab('content')
      scrollToTabs()
    }
  }

  const handleVideoSelect = (video: CourseVideo) => {
    if (!video.isFree && !isPremium && !course?.isFree) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: 'destructive',
      })
      return
    }
    setSelectedVideo(video)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="mb-4 flex items-center justify-center">
          <Loader2 className="text-dream-DEFAULT h-8 w-8 animate-spin" />
        </div>
        <h1 className="text-dream-DEFAULT font-bubbly text-2xl">
          {t('course.loading')}
        </h1>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-dream-DEFAULT mb-6 font-bubbly text-3xl">
          {t('course.error')}
        </h1>
        <p className="text-dream-DEFAULT mb-8 dark:text-foreground">
          {t('course.errorDesc')}
        </p>
        <Link to="/courses">
          <Button
            variant="outline"
            className="border-dream-DEFAULT text-dream-DEFAULT"
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
        <h1 className="text-dream-DEFAULT mb-6 font-bubbly text-3xl">
          {t('course.notFound')}
        </h1>
        <p className="text-dream-DEFAULT mb-8 dark:text-foreground">
          {t('course.notFoundDesc')}
        </p>
        <Link to="/courses">
          <Button
            variant="outline"
            className="border-dream-DEFAULT text-dream-DEFAULT"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative px-4 py-12">
      {/* Decorative background elements */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-float rounded-full bg-dream-light/10"></div>
      <div
        className="absolute bottom-20 right-10 h-16 w-16 animate-float rounded-full bg-moon-light/10"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="container mx-auto">
        <Link
          to="/courses"
          className="text-dream-DEFAULT mb-6 inline-flex items-center hover:text-dream-dark"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
        </Link>

        <div className="grid grid-cols-1 gap-8">
          {/* Course Header */}
          <div className="flex flex-col items-start gap-8 md:flex-row">
            <div className="md:w-1/3">
              <Card className="overflow-hidden border-dream-light/30">
                <img
                  src={course.coverImagePath}
                  alt={course.title}
                  className="aspect-[4/3] h-auto w-full object-cover"
                />
              </Card>
            </div>

            <div className="md:w-2/3">
              <h1 className="text-dream-DEFAULT mb-4 font-bubbly text-3xl md:text-4xl">
                {course.title}
              </h1>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="text-dream-DEFAULT border-none bg-dream-light/30">
                  {course.category
                    ? course.category.charAt(0).toUpperCase() +
                      course.category.slice(1)
                    : 'General'}
                </Badge>
                <Badge className="text-dream-DEFAULT border-none bg-moon-light/30">
                  {course.minAge}-{course.maxAge} {t('courses.years')}
                </Badge>
                {course.isFree ? (
                  <Badge className="bg-dream-DEFAULT/80 border-none text-white">
                    {t('free.tag')}
                  </Badge>
                ) : (
                  <Badge className="bg-moon-DEFAULT/80 border-none text-white">
                    {t('premium.tag')}
                  </Badge>
                )}
              </div>

              <div className="text-dream-DEFAULT mb-6 flex flex-wrap gap-4 text-sm dark:text-foreground">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {course.duration} {t('duration')}
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>
                    {course.lessons} {t('courses.lessons')}
                  </span>
                </div>
              </div>

              <p className="text-dream-DEFAULT mb-6 dark:text-foreground">
                {course.description}
              </p>

              <Button
                onClick={handleStartCourse}
                className={cn(
                  'rounded-full px-8 py-2',
                  course.isFree
                    ? 'bg-dream-DEFAULT text-white hover:bg-dream-dark'
                    : 'bg-moon-DEFAULT text-dream-DEFAULT hover:bg-moon-dark dark:text-white',
                )}
              >
                {course.isFree
                  ? t('button.startLearning')
                  : isAuthenticated && isPremium
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
              <TabsTrigger value="overview" className="text-dream-DEFAULT">
                {t('course.overview')}
              </TabsTrigger>
              <TabsTrigger value="content" className="text-dream-DEFAULT">
                {t('course.content')}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="prose prose-dream text-dream-DEFAULT mb-8 max-w-none dark:text-foreground">
                <h2 className="text-dream-DEFAULT mb-3 font-bubbly text-xl">
                  {t('course.about')}
                </h2>
                <p>{course.description}</p>

                {course.learningObjectives &&
                  course.learningObjectives.length > 0 && (
                    <>
                      <h2 className="text-dream-DEFAULT mb-3 mt-6 font-bubbly text-xl">
                        {t('course.whatYouLearn')}
                      </h2>
                      <ul className="list-disc pl-5">
                        {course.learningObjectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </>
                  )}

                {course.instructor && (
                  <>
                    <h2 className="text-dream-DEFAULT mb-3 mt-6 font-bubbly text-xl">
                      {t('course.instructor')}
                    </h2>
                    <div className="flex items-start gap-4">
                      {course.instructor.avatar && (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-dream-DEFAULT font-medium">
                          {course.instructor.name}
                        </h3>
                        <p className="text-dream-DEFAULT/80 mt-1 text-sm">
                          {course.instructor.bio}
                        </p>
                        {course.instructor.expertise &&
                          course.instructor.expertise.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {course.instructor.expertise.map(
                                (skill, index) => (
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
                          )}
                      </div>
                    </div>
                  </>
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
                        {/* Replace the iframe with HLSVideoPlayer */}
                        {selectedVideo.videoPath ? (
                          <HLSVideoPlayer
                            videoPath={selectedVideo.videoPath}
                            title={selectedVideo.title}
                            className="rounded-lg"
                          />
                        ) : selectedVideo.videoPath ? (
                          // Fallback for URL-based videos (if you still want to support them)
                          <iframe
                            src={selectedVideo.videoPath}
                            title={selectedVideo.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="flex h-full items-center justify-center text-white">
                            <p>No video source available</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-dream-DEFAULT mb-2 font-bubbly text-xl">
                          {selectedVideo.title}
                        </h3>
                        <div className="text-dream-DEFAULT mb-2 flex items-center text-sm dark:text-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>
                            {selectedVideo.duration} {t('duration')}
                          </span>
                        </div>
                        <p className="text-dream-DEFAULT dark:text-foreground">
                          {selectedVideo.description}
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
                  <h3 className="text-dream-DEFAULT mb-4 font-bubbly text-xl">
                    {t('course.courseVideos')}
                  </h3>

                  <div className="space-y-3">
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map(video => (
                        <Card
                          key={video.id}
                          className={cn(
                            'hover:border-dream-DEFAULT cursor-pointer transition-all',
                            selectedVideo?.id === video.id &&
                              'border-dream-DEFAULT',
                          )}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="relative h-16 w-24 flex-shrink-0">
                                <img
                                  src={video.thumbnailPath}
                                  alt={video.title}
                                  className="h-full w-full rounded object-cover"
                                />
                                {!video.isFree &&
                                  !course.isFree &&
                                  !isPremium && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50">
                                      <Lock className="h-6 w-6 text-white" />
                                    </div>
                                  )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                                  <div className="bg-dream-DEFAULT flex h-8 w-8 items-center justify-center rounded-full">
                                    <Play className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-dream-DEFAULT truncate text-sm font-medium">
                                  {video.title}
                                </h4>
                                <div className="text-dream-DEFAULT/70 mt-1 flex items-center text-xs">
                                  <Clock className="mx-1 h-3 w-3" />
                                  <span>
                                    {video.duration} {t('duration')}
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
