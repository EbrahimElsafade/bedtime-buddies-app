import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, Play, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CourseVideo } from '@/types/course'
import { useCourseData } from '@/hooks/useCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import GoogleDrivePlayer from '@/components/course/GoogleDrivePlayer'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { useTranslation } from 'react-i18next'
import { useGamification } from '@/hooks/useGamification'

import { CoursePremiumModal } from '@/components/course/CoursePremiumModal'
import { CourseCertificateSection } from '@/components/course/CourseCertificateSection'
import { useCourseProgress } from '@/hooks/useCourseProgress'

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, isLoading: authLoading, user, profile, isProfileLoaded } = useAuth()
  const { toast } = useToast()
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const profileLoading = !!user && !isProfileLoaded
  const isPremium = profile?.is_premium ?? false
  const { recordProgress } = useGamification()
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const {
    completedLessons,
    courseProgress,
    isComplete,
    refetch: refetchProgress,
  } = useCourseProgress(courseId, course?.lessons ?? course?.videos?.length ?? 0)

  // (Premium gating now happens per-lesson via the modal triggered in handleVideoSelect)

  useEffect(() => {
    setIsLoading(isLoading || profileLoading)
    if (isLoading || profileLoading) {
      setLoadingMessage(t('loading.course', { ns: 'common' }))
    }
    return () => {
      setIsLoading(false)
      setLoadingMessage(undefined)
    }
  }, [isLoading, profileLoading, setIsLoading, setLoadingMessage, t])

  // Safety timeout: never let the global loader hang
  useEffect(() => {
    if (!isLoading && !profileLoading) return
    const id = setTimeout(() => {
      setIsLoading(false)
      setLoadingMessage(undefined)
    }, 10000)
    return () => clearTimeout(id)
  }, [isLoading, profileLoading, setIsLoading, setLoadingMessage])

  useEffect(() => {
    if (course && !profileLoading) {
      document.title = `${getLocalized(course, 'title', lang)} - ${t('course.lessons')} | Dolphoon`
      // Set the first video as selected by default if there are videos
      if (course.videos && course.videos.length > 0 && !selectedVideo) {
        const firstVideo = course.videos[0]
        // Only auto-select if premium or video is free
        if (isPremium || firstVideo.isFree) {
          setSelectedVideo(firstVideo)
          // Record initial lesson progress
          if (courseId && firstVideo.id) {
            recordProgress('course_lesson', firstVideo.id, courseId).then(() =>
              refetchProgress(),
            )
          }
        }
      }
    }
  }, [course, lang, t, selectedVideo, courseId, isPremium, profileLoading, recordProgress])

  const handleVideoSelect = async (video: CourseVideo) => {
    // Allow access if user is premium OR if the lesson is free
    if (!isPremium && !video.isFree) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: 'destructive',
      })
      return
    }
    setSelectedVideo(video)
    
    // Record lesson progress for gamification
    if (courseId && video.id) {
      await recordProgress('course_lesson', video.id, courseId)
      await refetchProgress()
    }
  }

  const handleVideoEnd = () => {
    if (!course?.videos || !selectedVideo) return

    const currentIndex = course.videos.findIndex(v => v.id === selectedVideo.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < course.videos.length) {
      const nextVideo = course.videos[nextIndex]
      // select next video
      handleVideoSelect(nextVideo)
    }
  }

  const getNextVideoExists = (): boolean => {
    if (!course?.videos || !selectedVideo) return false
    const currentIndex = course.videos.findIndex(v => v.id === selectedVideo.id)
    return currentIndex + 1 < course.videos.length
  }

  

  // Note: we intentionally allow unauthenticated users to enter the lessons
  // page so they can preview free lessons. Premium-locked lessons trigger
  // the subscription modal instead of a redirect.

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

  // Show premium message for non-premium users on premium courses
  if (showPremiumMessage && !profileLoading) {
    return (
      <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-8">
        <div className="container mx-auto">
          <Button
            variant="tertiary"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mb-8 w-fit rounded-md shadow"
          >
            <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />{' '}
            {t('button.backToCourses')}
          </Button>
          
          <div className="mx-auto max-w-2xl">
            <PremiumMessage
              onSubscriptionClick={() => navigate('/profile?tab=subscription')}
              onLoginClick={() => navigate('/login')}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-8">
      <Helmet>
        <title>
          {getLocalized(course, 'title', lang)} - {t('course.lessons')} |{' '}
          {t('meta:name')}
        </title>
        <meta
          name="description"
          content={getLocalized(course, 'description', lang)}
        />
      </Helmet>

      {/* Decorative background elements */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-float rounded-full bg-primary/10"></div>
      <div
        className="bg-moon-light/10 absolute bottom-20 right-10 h-16 w-16 animate-float rounded-full"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 grid gap-4 lg:gap-8">
          <Button
            variant="tertiary"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-fit rounded-md shadow"
          >
            <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />{' '}
            {t('button.backToCourses')}
          </Button>

          <div>
            <h1 className="font-bubbly text-2xl text-primary-foreground md:text-3xl">
              {getLocalized(course, 'title', lang)}
            </h1>
          </div>
        </div>

        <div className="mb-6">
          <CourseCertificateSection
            course={course}
            studentName={profile?.child_name || profile?.parent_name || ''}
            progress={courseProgress}
            isComplete={isComplete}
            compact
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Video Player */}
          <div className="lg:flex-[2]">
            {selectedVideo ? (
              <div className="grid gap-4">
                <div className="aspect-video overflow-hidden rounded-lg bg-black">
                  {selectedVideo.videoUrl ? (
                    <GoogleDrivePlayer
                      fileId={selectedVideo.videoUrl}
                      title={getLocalized(selectedVideo, 'title', lang)}
                      className="rounded-lg"
                      onVideoEnd={handleVideoEnd}
                      showCountdownOnEnd={getNextVideoExists()}
                      
                    />
                  ) : selectedVideo.videoPath ? (
                    <div className="flex h-full items-center justify-center text-secondary">
                      <p>{t('course.legacyVideoFormat')}</p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-secondary">
                      <p>{t('course.noVideoSource')}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="mb-2 font-bubbly text-xl text-primary-foreground">
                    {getLocalized(selectedVideo, 'title', lang)}
                  </h3>

                  <div className="mb-2 flex items-center gap-2 text-sm text-primary-foreground">
                    <Clock className="size-4" />

                    <span>
                      {Math.floor(selectedVideo.duration / 60)}:
                      {String(selectedVideo.duration % 60).padStart(2, '0')}{' '}
                      {t('duration')}
                    </span>
                  </div>
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
          <div className="max-h-[55vh] pe-4 flex-1 overflow-y-scroll">
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
                          {!isPremium && !video.isFree && (
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
                          <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-medium text-primary-foreground">
                              {getLocalized(video, 'title', lang)}
                            </h4>
                            {video.isFree && (
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-xs"
                              >
                                {t('common:free', 'Free')}
                              </Badge>
                            )}
                            {completedLessons.includes(video.id) && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-xs text-primary-foreground/70">
                            <Clock className="mx-1 h-3 w-3" />
                            <span>
                              {Math.floor(video.duration / 60)}:
                              {String(video.duration % 60).padStart(2, '0')}
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
      </div>
    </div>
  )
}

export default CourseLessons
