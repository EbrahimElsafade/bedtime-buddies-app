import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock, Play, Lock, ChevronLeft } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CourseVideo } from '@/types/course'
import { useCourseData } from '@/hooks/useCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import YouTubePlayer from '@/components/course/YouTubePlayer'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'
import { useTranslation } from 'react-i18next'
import { useUserRole } from '@/hooks/useUserRole'
import { getYouTubeDuration } from '@/hooks/useYouTubeDuration'

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'meta', 'common'])
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null)
  const [autoplayNext, setAutoplayNext] = useState(false)

  const { setIsLoading, setLoadingMessage } = useLoading()
  const { data: course, isLoading, error } = useCourseData(courseId)
  const { isPremium } = useUserRole(user)
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>({})

  useEffect(() => {
    setIsLoading(isLoading)
    if (isLoading) {
      setLoadingMessage(t('loading.course', { ns: 'common' }))
    }
  }, [isLoading, setIsLoading, setLoadingMessage, t])

  useEffect(() => {
    if (course) {
      document.title = `${getLocalized(course, 'title', lang)} - ${t('course.lessons')} | Dolphoon`
      // Set the first video as selected by default if there are videos
      if (course.videos && course.videos.length > 0 && !selectedVideo) {
        setSelectedVideo(course.videos[0])
        setAutoplayNext(false)
      }
    }
  }, [course, lang, t, selectedVideo])

  // When a video is selected, try to compute its duration from YouTube
  useEffect(() => {
    const load = async () => {
      if (!selectedVideo) return
      if (!selectedVideo.videoUrl) return
      // If we already have a computed duration, skip
      if (videoDurations[selectedVideo.id] && videoDurations[selectedVideo.id] > 0) return

      const d = await getYouTubeDuration(selectedVideo.videoUrl)
      if (d && d > 0) {
        setVideoDurations(prev => ({ ...prev, [selectedVideo.id]: d }))
      }
    }

    load()
  }, [selectedVideo, videoDurations])

  // Compute durations for all videos in the course (background)
  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      if (!course?.videos) return
      for (const v of course.videos) {
        if (!mounted) return
        if (!v.videoUrl) continue
        if (videoDurations[v.id] && videoDurations[v.id] > 0) continue
        const d = await getYouTubeDuration(v.videoUrl)
        if (d && d > 0 && mounted) {
          setVideoDurations(prev => ({ ...prev, [v.id]: d }))
        }
      }
    }

    loadAll()
    return () => { mounted = false }
  }, [course, videoDurations])

  const handleVideoSelect = (video: CourseVideo) => {
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
    setAutoplayNext(false)
  }

  const handleVideoEnd = () => {
    if (!course?.videos || !selectedVideo) return

    const currentIndex = course.videos.findIndex(v => v.id === selectedVideo.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < course.videos.length) {
      const nextVideo = course.videos[nextIndex]
      setAutoplayNext(true)
      handleVideoSelect(nextVideo)
    }
  }

  const getNextVideoExists = (): boolean => {
    if (!course?.videos || !selectedVideo) return false
    const currentIndex = course.videos.findIndex(v => v.id === selectedVideo.id)
    return currentIndex + 1 < course.videos.length
  }

  const handleCountdownCancel = () => {
    setAutoplayNext(false)
  }

  // Redirect to login if not authenticated
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

        {/* Content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Video Player */}
          <div className="lg:flex-[2]">
            {selectedVideo ? (
              <div className="grid gap-4">
                <div className="aspect-video overflow-hidden rounded-lg bg-black">
                  {selectedVideo.videoUrl ? (
                    <YouTubePlayer
                      videoId={selectedVideo.videoUrl}
                      title={getLocalized(selectedVideo, 'title', lang)}
                      className="rounded-lg"
                      onVideoEnd={handleVideoEnd}
                      showCountdownOnEnd={getNextVideoExists()}
                      autoplay={autoplayNext}
                      onCountdownCancel={handleCountdownCancel}
                    />
                  ) : selectedVideo.videoPath ? (
                    <div className="flex h-full items-center justify-center text-secondary">
                      <p>Legacy video format - please update to YouTube</p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-secondary">
                      <p>No video source available</p>
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
                      {(() => {
                        const dur = videoDurations[selectedVideo.id] ?? selectedVideo.duration ?? 0
                        const m = Math.floor(dur / 60)
                        const s = String(dur % 60).padStart(2, '0')
                        return `${m}:${s} ${t('duration')}`
                      })()}
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
                          </div>
                          <div className="mt-1 flex items-center text-xs text-primary-foreground/70">
                            <Clock className="mx-1 h-3 w-3" />
                            <span>
                              {(() => {
                                const dur = videoDurations[video.id] ?? video.duration ?? 0
                                const m = Math.floor(dur / 60)
                                const s = String(dur % 60).padStart(2, '0')
                                return `${m}:${s}`
                              })()}
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
