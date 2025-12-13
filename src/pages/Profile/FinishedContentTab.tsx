import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Star, Trophy, Award, Medal, Crown } from 'lucide-react'
import { useContentProgress } from '@/hooks/useContentProgress'
import { useLanguage } from '@/contexts/LanguageContext'
import { Link } from 'react-router-dom'

interface Milestone {
  id: number
  name: string
  nameAr: string
  nameFr: string
  threshold: number
  icon: React.ReactNode
  color: string
}

const MILESTONES: Milestone[] = [
  { id: 1, name: 'Beginner', nameAr: 'مبتدئ', nameFr: 'Débutant', threshold: 5, icon: <Star className="h-5 w-5" />, color: 'bg-amber-500' },
  { id: 2, name: 'Explorer', nameAr: 'مستكشف', nameFr: 'Explorateur', threshold: 10, icon: <Medal className="h-5 w-5" />, color: 'bg-sky-500' },
  { id: 3, name: 'Achiever', nameAr: 'منجز', nameFr: 'Accompli', threshold: 15, icon: <Award className="h-5 w-5" />, color: 'bg-emerald-500' },
  { id: 4, name: 'Champion', nameAr: 'بطل', nameFr: 'Champion', threshold: 20, icon: <Trophy className="h-5 w-5" />, color: 'bg-purple-500' },
  { id: 5, name: 'Master', nameAr: 'سيد', nameFr: 'Maître', threshold: 25, icon: <Crown className="h-5 w-5" />, color: 'bg-rose-500' },
]

export const FinishedContentTab = () => {
  const { t } = useTranslation('common')
  const { language } = useLanguage()
  const { completedContent, totalPoints, isLoading } = useContentProgress()

  // Fetch completed stories details
  const { data: completedStoriesDetails } = useQuery({
    queryKey: ['completed-stories-details', completedContent?.stories],
    queryFn: async () => {
      if (!completedContent?.stories?.length) return []
      const storyIds = completedContent.stories.map(s => s.content_id)
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, cover_image')
        .in('id', storyIds)
      if (error) throw error
      return data || []
    },
    enabled: !!completedContent?.stories?.length,
  })

  // Fetch completed courses details
  const { data: completedCoursesDetails } = useQuery({
    queryKey: ['completed-courses-details', completedContent?.courses],
    queryFn: async () => {
      if (!completedContent?.courses?.length) return []
      const courseIds = completedContent.courses.map(c => c.content_id)
      const { data, error } = await supabase
        .from('courses')
        .select('id, title_en, title_ar, title_fr, cover_image')
        .in('id', courseIds)
      if (error) throw error
      return data || []
    },
    enabled: !!completedContent?.courses?.length,
  })

  const getMilestoneName = (milestone: Milestone) => {
    if (language === 'ar') return milestone.nameAr
    if (language === 'fr') return milestone.nameFr
    return milestone.name
  }

  const currentMilestone = MILESTONES.filter(m => totalPoints >= m.threshold).pop()
  const nextMilestone = MILESTONES.find(m => totalPoints < m.threshold)
  const progressToNextMilestone = nextMilestone 
    ? ((totalPoints - (currentMilestone?.threshold || 0)) / (nextMilestone.threshold - (currentMilestone?.threshold || 0))) * 100
    : 100

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">{t('loading.default')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('finishedContent.milestones')}
          </CardTitle>
          <CardDescription>
            {t('finishedContent.totalPoints', { count: totalPoints })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Milestones badges */}
          <div className="flex flex-wrap gap-3 justify-center">
            {MILESTONES.map(milestone => {
              const isUnlocked = totalPoints >= milestone.threshold
              return (
                <div
                  key={milestone.id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                    isUnlocked 
                      ? `${milestone.color} text-white shadow-lg scale-105` 
                      : 'bg-muted text-muted-foreground opacity-50'
                  }`}
                >
                  {milestone.icon}
                  <span className="text-xs font-medium">{getMilestoneName(milestone)}</span>
                  <span className="text-xs opacity-80">{milestone.threshold} pts</span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentMilestone ? getMilestoneName(currentMilestone) : t('finishedContent.noMilestone')}</span>
              {nextMilestone && (
                <span className="text-muted-foreground">
                  {t('finishedContent.nextMilestone')}: {getMilestoneName(nextMilestone)} ({nextMilestone.threshold - totalPoints} {t('finishedContent.pointsNeeded')})
                </span>
              )}
            </div>
            <Progress value={progressToNextMilestone} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Finished Stories */}
      <Card>
        <CardHeader>
          <CardTitle>{t('finishedContent.finishedStories')}</CardTitle>
          <CardDescription>
            {completedContent?.stories?.length || 0} {t('finishedContent.storiesCompleted')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedStoriesDetails && completedStoriesDetails.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {completedStoriesDetails.map(story => {
                const storyTitle = story.title as Record<string, string>
                const title = storyTitle?.[language] || storyTitle?.['en'] || 'Story'
                return (
                  <Link
                    key={story.id}
                    to={`/stories/${story.id}`}
                    className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                  >
                    <div className="aspect-[3/4] relative">
                      {story.cover_image ? (
                        <img
                          src={story.cover_image.startsWith('http') ? story.cover_image : `https://brxbtgzaumryxflkykpp.supabase.co/storage/v1/object/public/story-images/${story.cover_image}`}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Star className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-emerald-500">
                        ✓
                      </Badge>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium line-clamp-2">{title}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('finishedContent.noFinishedStories')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Finished Courses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('finishedContent.finishedCourses')}</CardTitle>
          <CardDescription>
            {completedContent?.courses?.length || 0} {t('finishedContent.coursesCompleted')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedCoursesDetails && completedCoursesDetails.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {completedCoursesDetails.map(course => {
                const title = language === 'ar' ? course.title_ar : language === 'fr' ? course.title_fr : course.title_en
                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                  >
                    <div className="aspect-video relative">
                      {course.cover_image ? (
                        <img
                          src={course.cover_image.startsWith('http') ? course.cover_image : `https://brxbtgzaumryxflkykpp.supabase.co/storage/v1/object/public/admin-content/course-covers/${course.cover_image}`}
                          alt={title || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-emerald-500">
                        ✓
                      </Badge>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium line-clamp-2">{title || course.title_en}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('finishedContent.noFinishedCourses')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
