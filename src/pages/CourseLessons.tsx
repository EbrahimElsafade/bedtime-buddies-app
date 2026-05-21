import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, Play, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

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
import { supabase } from '@/integrations/supabase/client'

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, user, profile, isProfileLoaded } = useAuth()
  
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const profileLoading = !!user && !isProfileLoaded
  const isPremium = profile?.is_premium ?? false
  const { refreshStats, refreshFinishedContent } = useGamification()
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const {
    completedLessons,
    lessonProgress,
    courseProgress,
    isComplete,
    totalLessons,
    refetch: refetchProgress,
  } = useCourseProgress(courseId)

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
      // NOTE: we no longer record progress here — completion is explicit only.
      if (course.videos && course.videos.length > 0 && !selectedVideo) {
        const firstVideo = course.videos[0]
        if (isPremium || firstVideo.isFree) {
          setSelectedVideo(firstVideo)
        }
      }
    }
  }, [course, lang, t, selectedVideo, isPremium, profileLoading])

  const handleVideoSelect = (video: CourseVideo) => {
    // Allow access if user is premium OR if the lesson is free
    if (!isPremium && !video.isFree) {
      setShowPremiumModal(true)
      return
    }
    setSelectedVideo(video)
    // Progress is no longer auto-recorded on lesson open — user must explicitly
    // click "Mark as completed" to count the lesson toward course progress.
  }

  const handleMarkCompleted = async () => {
    if (!courseId || !selectedVideo || !user) return
    if (completedLessons.includes(selectedVideo.id)) return
    const duration = selectedVideo.duration || 0
    await supabase.rpc('record_course_lesson_watch_progress', {
      _user_id: user.id,
      _course_id: courseId,
      _lesson_id: selectedVideo.id,
      _watched_seconds: duration,
      _duration_seconds: duration,
      _explicit_complete: true,
      _completion_threshold: 85,
    })
    await Promise.all([
      refetchProgress(),
      refreshStats(),
      refreshFinishedContent(),
    ])
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

  // (Premium gating now uses an inline modal instead of a full-page block.)

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

                {/* Explicit completion button — only marks lesson done when user clicks */}
                {isAuthenticated && (isPremium || selectedVideo.isFree) && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-xs font-medium text-primary-foreground/80">
                        <span className="tabular-nums">{Math.round(courseProgress)}%</span>
                        <span className="tabular-nums">
                          {completedLessons.length}/{totalLessons}
                        </span>
                      </div>
                      <Progress
                        value={courseProgress}
                        className="sp-progress--animated h-2"
                        indicatorClassName="sp-progress-indicator--animated"
                      />
                    </div>
                    <Button
                      onClick={handleMarkCompleted}
                      disabled={completedLessons.includes(selectedVideo.id)}
                      variant={
                        completedLessons.includes(selectedVideo.id)
                          ? 'secondary'
                          : 'default'
                      }
                      className="shrink-0 transition-all duration-300"
                    >
                      <CheckCircle2 className="me-2 h-4 w-4" />
                      {completedLessons.includes(selectedVideo.id)
                        ? t('course.completed', { defaultValue: 'Completed' })
                        : t('course.markCompleted', {
                            defaultValue: 'Mark as completed',
                          })}
                    </Button>
                  </div>
                )}
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
                course.videos.map(video => {
                  const isCompleted = completedLessons.includes(video.id)
                  const isCurrent = selectedVideo?.id === video.id
                  const isLocked = !isPremium && !video.isFree
                  const watch = lessonProgress[video.id]
                  return (
                    <Card
                      key={video.id}
                      className={cn(
                        'group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                        isCurrent && 'border-primary-foreground shadow-md ring-2 ring-primary-foreground/30',
                        isCompleted && !isCurrent && 'border-green-500/60 bg-green-500/5',
                        isLocked && 'opacity-90',
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
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50">
                                <Lock className="h-6 w-6 text-secondary" />
                              </div>
                            )}
                            {isCompleted && !isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center rounded bg-green-600/70 transition-opacity">
                                <CheckCircle2 className="h-7 w-7 text-white drop-shadow" />
                              </div>
                            )}
                            {!isCompleted && !isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground">
                                  <Play className="h-4 w-4 text-secondary" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={cn(
                                  'truncate text-sm font-medium text-primary-foreground transition-colors',
                                  isCompleted && 'text-green-700',
                                )}
                              >
                                {getLocalized(video, 'title', lang)}
                              </h4>
                              {video.isFree && !isCompleted && (
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-xs"
                                >
                                  {t('common:free', 'Free')}
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge className="gap-1 bg-green-600 px-1.5 py-0 text-xs text-white hover:bg-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('course.completed', { defaultValue: 'Completed' })}
                                </Badge>
                              )}
                              {isCurrent && !isCompleted && (
                                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                                  ●
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-primary-foreground/70">
                              <Clock className="mx-1 h-3 w-3" />
                              <span>
                                {Math.floor(video.duration / 60)}:
                                {String(video.duration % 60).padStart(2, '0')}
                              </span>
                              {watch && !isCompleted && watch.watchedPercent > 0 && (
                                <span className="tabular-nums text-primary-foreground/60">
                                  · {Math.round(watch.watchedPercent)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  {t('course.noVideos')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="max-w-2xl">
          <CoursePremiumModal
            courseTitle={getLocalized(course, 'title', lang)}
            onSubscriptionClick={() => {
              setShowPremiumModal(false)
              if (!isAuthenticated) {
                navigate('/login')
              } else {
                navigate('/profile?tab=subscription')
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CourseLessons
