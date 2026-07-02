import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, Play, Lock, ChevronLeft, CheckCircle2, Menu, X } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Progress } from '@/components/ui/progress'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CourseVideo } from '@/types/course'
import { useCourseData } from '@/hooks/useCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import GoogleDrivePlayer from '@/components/course/GoogleDrivePlayer'

import { getLocalized } from '@/utils/getLocalized'
import { useTranslation } from 'react-i18next'
import { useGamification } from '@/hooks/useGamification'

import { CoursePremiumModal } from '@/components/course/CoursePremiumModal'
import { CourseCertificateSection } from '@/components/course/CourseCertificateSection'
import { useCourseProgress } from '@/hooks/useCourseProgress'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { isMembershipActive } from '@/utils/membership'

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, user, profile, isProfileLoaded } = useAuth()
  
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isTabletRange, setIsTabletRange] = useState(false)
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1290px)')
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTabletRange(e.matches)
      if (!e.matches) setTabletSidebarOpen(false)
    }
    onChange(mql)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  
  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const profileLoading = !!user && !isProfileLoaded
  const isPremium = isMembershipActive(profile)
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

  // Mark the lesson as completed shortly after the user opens it.
  // We don't gate completion on watched seconds because playback speed
  // (e.g. 2x) would otherwise prevent reaching the threshold.
  const completedRef = useRef<Record<string, boolean>>({})

  const markLessonComplete = async (lessonId: string, durationSec: number) => {
    if (!courseId || !user) return
    if (completedRef.current[lessonId]) return
    completedRef.current[lessonId] = true
    const safeDuration = Math.max(durationSec, 1)
    const { error } = await supabase.rpc(
      'record_course_lesson_watch_progress',
      {
        _user_id: user.id,
        _course_id: courseId,
        _lesson_id: lessonId,
        _watched_seconds: safeDuration,
        _duration_seconds: safeDuration,
        _explicit_complete: true,
        _completion_threshold: 85,
      },
    )
    if (error) {
      console.error('record_course_lesson_watch_progress error', error)
      completedRef.current[lessonId] = false
      return
    }
    await Promise.all([
      refetchProgress(),
      refreshStats(),
      refreshFinishedContent(),
    ])
  }

  useEffect(() => {
    if (!selectedVideo || !user || !courseId) return
    if (!isPremium && !selectedVideo.isFree) return
    const lessonId = selectedVideo.id
    if (completedLessons.includes(lessonId)) return
    const durationSec = Math.max(selectedVideo.duration || 1, 1)

    const timer = setTimeout(() => {
      markLessonComplete(lessonId, durationSec)
    }, 3000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo?.id, user?.id, courseId, isPremium, completedLessons])

  const handleVideoEnd = () => {
    if (!course?.videos || !selectedVideo) return
    const lessonId = selectedVideo.id
    const durationSec = Math.max(selectedVideo.duration || 1, 1)
    markLessonComplete(lessonId, durationSec)

    const currentIndex = course.videos.findIndex(v => v.id === selectedVideo.id)
    const nextIndex = currentIndex + 1
    if (nextIndex < course.videos.length) {
      handleVideoSelect(course.videos[nextIndex])
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

        {/* Unified Course Player Container */}
        <div className="relative rounded-2xl border border-border bg-white shadow-xl">
          {isTabletRange && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setTabletSidebarOpen(v => !v)}
              className="absolute end-3 top-3 z-30 bg-white shadow-md hover:bg-white"
              aria-expanded={tabletSidebarOpen}
              aria-label={tabletSidebarOpen ? 'Hide lessons' : 'Show lessons'}
            >
              {tabletSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="ms-2">{t('course.lessons')}</span>
            </Button>
          )}
          <div className="flex flex-col lg:flex-row lg:overflow-hidden lg:rounded-2xl">
            {/* Lessons sidebar */}
            <aside
              className={cn(
                'order-2 w-full border-t border-border bg-secondary/40 lg:order-1 lg:max-h-[calc(100vh-10rem)] lg:w-[340px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-r lg:border-t-0 rtl:lg:border-l rtl:lg:border-r-0',
                isTabletRange &&
                  (tabletSidebarOpen
                    ? 'absolute inset-y-0 end-0 z-20 !w-[340px] !max-w-[85%] !max-h-full overflow-y-auto border-s border-t-0 bg-white shadow-2xl rtl:border-e rtl:border-s-0'
                    : 'hidden'),
              )}
            >
              <div className="sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-3 backdrop-blur">
                <h2 className="font-bubbly text-sm font-bold text-primary-foreground">
                  {t('course.lessons')}
                </h2>
                <p className="mt-0.5 text-xs text-primary-foreground/60 tabular-nums">
                  {completedLessons.length}/{totalLessons} · {Math.round(courseProgress)}%
                </p>
              </div>
              <div className="space-y-2 p-3">
                {course.videos && course.videos.length > 0 ? (
                  course.videos.map((video, idx) => {
                    const isCompleted = completedLessons.includes(video.id)
                    const isCurrent = selectedVideo?.id === video.id
                    const isLocked = !isPremium && !video.isFree
                    const watch = lessonProgress[video.id]
                    return (
                      <button
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        className={cn(
                          'group flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left transition-all duration-200 hover:bg-white hover:shadow-sm rtl:text-right',
                          isCurrent &&
                            'border-primary-foreground/30 bg-white shadow-md ring-1 ring-primary-foreground/20',
                          isCompleted && !isCurrent && 'border-green-500/30 bg-green-500/5',
                          isLocked && 'opacity-80',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors',
                            isCompleted
                              ? 'bg-green-600 text-white'
                              : isCurrent
                              ? 'bg-primary-foreground text-white'
                              : isLocked
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-secondary text-primary-foreground',
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : isCurrent ? (
                            <Play className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className={cn(
                                'truncate text-sm font-medium text-primary-foreground',
                                isCompleted && 'text-green-700',
                              )}
                            >
                              {getLocalized(video, 'title', lang)}
                            </h4>
                            {video.isFree && !isCompleted && (
                              <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                                {t('common:free', 'Free')}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-primary-foreground/60">
                            <Clock className="h-3 w-3" />
                            <span className="tabular-nums">
                              {Math.floor(video.duration / 60)}:
                              {String(video.duration % 60).padStart(2, '0')}
                            </span>
                            {watch && !isCompleted && watch.watchedPercent > 0 && (
                              <span className="tabular-nums text-primary-foreground/50">
                                · {Math.round(watch.watchedPercent)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t('course.noVideos')}
                  </p>
                )}
              </div>
            </aside>

            {/* Video player */}
            <div className="order-1 min-w-0 flex-1 bg-white lg:order-2">
              {selectedVideo ? (
                <div className="flex flex-col">
                  <div className="w-full min-w-0 bg-black">
                    {selectedVideo.videoUrl ? (
                      <GoogleDrivePlayer
                        fileId={selectedVideo.videoUrl}
                        title={getLocalized(selectedVideo, 'title', lang)}
                        onVideoEnd={handleVideoEnd}
                        showCountdownOnEnd={getNextVideoExists()}
                      />
                    ) : selectedVideo.videoPath ? (
                      <div className="flex aspect-video items-center justify-center text-white">
                        <p>{t('course.legacyVideoFormat')}</p>
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center text-white">
                        <p>{t('course.noVideoSource')}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bubbly text-xl text-primary-foreground md:text-2xl">
                          {getLocalized(selectedVideo, 'title', lang)}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/70">
                          <Clock className="h-4 w-4" />
                          <span className="tabular-nums">
                            {Math.floor(selectedVideo.duration / 60)}:
                            {String(selectedVideo.duration % 60).padStart(2, '0')}{' '}
                            {t('duration')}
                          </span>
                        </div>
                      </div>
                      {completedLessons.includes(selectedVideo.id) && (
                        <Badge className="gap-1 bg-green-600 text-white hover:bg-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t('course.completed', { defaultValue: 'Completed' })}
                        </Badge>
                      )}
                    </div>

                    {isAuthenticated && (isPremium || selectedVideo.isFree) && (
                      <div className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/40 p-3">
                        <div className="flex items-center justify-between text-xs font-medium text-primary-foreground/80">
                          <span className="tabular-nums">
                            {Math.round(courseProgress)}%
                          </span>
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-secondary">
                  <p className="text-center text-muted-foreground">
                    {t('course.selectVideo')}
                  </p>
                </div>
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
