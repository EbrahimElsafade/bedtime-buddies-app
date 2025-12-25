import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Trophy, Star, Award, Medal, Crown } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import {
  FinishedStory,
  FinishedCourse,
  GamificationStats,
} from '@/hooks/useGamification'
import { cn } from '@/lib/utils'

interface FinishedContentTabProps {
  stats: GamificationStats
  finishedStories: FinishedStory[]
  finishedCourses: FinishedCourse[]
  language: string
  t: (key: string) => string
  isLoading: boolean
}

const MILESTONES = [
  {
    id: 1,
    points: 5,
    icon: Star,
    label: 'starExplorer',
    color: 'text-yellow-500',
  },
  {
    id: 2,
    points: 10,
    icon: Award,
    label: 'risingStar',
    color: 'text-blue-500',
  },
  {
    id: 3,
    points: 25,
    icon: Medal,
    label: 'champion',
    color: 'text-purple-500',
  },
  {
    id: 4,
    points: 50,
    icon: Trophy,
    label: 'master',
    color: 'text-orange-500',
  },
  { id: 5, points: 100, icon: Crown, label: 'legend', color: 'text-primary' },
]

export const FinishedContentTab = ({
  stats,
  finishedStories,
  finishedCourses,
  language,
  t,
  isLoading,
}: FinishedContentTabProps) => {
  const navigate = useNavigate()

  const getStoryTitle = (story: FinishedStory['story']) => {
    if (!story) return ''
    return story.title[language] || story.title.en || ''
  }

  const getCourseTitle = (course: FinishedCourse['course']) => {
    if (!course) return ''
    const langKey = `title_${language}` as keyof typeof course
    return (course[langKey] as string) || course.title_en || ''
  }

  const getNextMilestone = () => {
    const nextMilestone = MILESTONES.find(m => stats.totalPoints < m.points)
    return nextMilestone || MILESTONES[MILESTONES.length - 1]
  }

  const getProgressToNextMilestone = () => {
    const nextMilestone = getNextMilestone()
    const prevMilestone = MILESTONES.find(
      m => m.points === nextMilestone.points,
    )
    const prevMilestoneIndex = MILESTONES.indexOf(prevMilestone!)
    const previousPoints =
      prevMilestoneIndex > 0 ? MILESTONES[prevMilestoneIndex - 1].points : 0

    if (stats.totalPoints >= MILESTONES[MILESTONES.length - 1].points) {
      return 100
    }

    const progressRange = nextMilestone.points - previousPoints
    const currentProgress = stats.totalPoints - previousPoints
    return Math.min(100, Math.max(0, (currentProgress / progressRange) * 100))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">
            {t('loading')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6" dir='auto'>
      {/* Progress & Milestones Header */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('myProgress')}
          </CardTitle>
          <CardDescription>{t('progressDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Points Display */}
          <div className="mb-6 text-center">
            <div className="text-4xl font-bold text-primary">
              {stats.totalPoints}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('totalPoints')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                {t('nextMilestone')}: {t(`milestone.${getNextMilestone().label}`)}
              </span>
              <span>
                {getNextMilestone().points} {t('points')}
              </span>
            </div>
            <Progress value={getProgressToNextMilestone()} className="h-3" />
          </div>

          {/* Milestone Badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {MILESTONES.map(milestone => {
              const Icon = milestone.icon
              const isUnlocked = stats.unlockedMilestones.includes(milestone.id)

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg p-3 transition-all',
                    isUnlocked
                      ? 'scale-105 bg-primary/20'
                      : 'bg-muted/50 opacity-50 grayscale',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2',
                      isUnlocked
                        ? `border-primary ${milestone.color}`
                        : 'border-muted-foreground/30 text-muted-foreground',
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium">
                    {t(`milestone.${milestone.label}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {milestone.points} pts
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Finished Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('finishedStories')}
          </CardTitle>
          <CardDescription>
            {finishedStories.length} {t('storiesCompleted')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finishedStories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                {t('noFinishedStoriesYet')}
              </p>
              <Button onClick={() => navigate('/stories')}>
                {t('browseStories')}
              </Button>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {finishedStories.map(item => {
                if (!item.story) return null
                const title = getStoryTitle(item.story)
                const imageUrl = getImageUrl(item.story.cover_image)

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => navigate(`/stories/${item.content_id}`)}
                  >
                    <CardContent className="p-4">
                      {imageUrl && (
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="mb-3 h-32 w-full rounded object-cover"
                          />
                          <Badge className="absolute right-2 top-2 bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t('completed')}
                          </Badge>
                        </div>
                      )}
                      <h4 className="mb-1 font-medium">{title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t('finishedOn')}{' '}
                        {new Date(item.finished_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finished Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('finishedCourses')}
          </CardTitle>
          <CardDescription>
            {finishedCourses.length} {t('coursesCompleted')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finishedCourses.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                {t('noFinishedCoursesYet')}
              </p>
              <Button onClick={() => navigate('/courses')}>
                {t('browseCourses')}
              </Button>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {finishedCourses.map(item => {
                if (!item.course) return null
                const title = getCourseTitle(item.course)
                const imageUrl = getImageUrl(item.course.cover_image)

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => navigate(`/courses/${item.content_id}`)}
                  >
                    <CardContent className="p-4">
                      {imageUrl && (
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="mb-3 h-32 w-full rounded object-cover"
                          />
                          <Badge className="absolute right-2 top-2 bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t('completed')}
                          </Badge>
                        </div>
                      )}
                      <h4 className="mb-1 font-medium">{title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t('finishedOn')}{' '}
                        {new Date(item.finished_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
