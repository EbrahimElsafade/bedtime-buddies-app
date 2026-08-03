import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCoursesData } from '@/hooks/useCourseData'
import { useMyPurchasedCourseIds } from '@/hooks/useCoursePurchases'
import { useCoursesProgress } from '@/hooks/useCourseProgress'
import { getImageUrl } from '@/utils/imageUtils'
import { getLocalized } from '@/utils/getLocalized'

export const PurchasedCoursesTab = () => {
  const { t } = useTranslation('courses')
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
  const { data: ownedCourseIds = [], isLoading: purchasesLoading } =
    useMyPurchasedCourseIds()
  const { data: courses = [], isLoading } = useCoursesData()

  const owned = courses.filter(course => ownedCourseIds.includes(course.id))
  const { data: progressMap = {} } = useCoursesProgress(owned.map(c => c.id))


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('purchased.title')}</CardTitle>
        <CardDescription>{t('purchased.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || purchasesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-secondary/50" />
            ))}
          </div>
        ) : owned.length === 0 ? (
          <div className="space-y-4 py-8 text-center">
            <p className="text-muted-foreground">{t('purchased.empty')}</p>
            <Link to="/courses">
              <Button variant="accent">{t('purchased.browse')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {owned.map(course => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="flex gap-3 rounded-lg border border-primary/20 bg-secondary/40 p-3 transition-colors hover:bg-secondary/60"
              >
                <img
                  src={getImageUrl(course.coverImagePath)}
                  alt={getLocalized(course, 'title', lang)}
                  className="h-20 w-28 flex-shrink-0 rounded-md object-cover"
                />
                <div className="grid min-w-0 flex-1 content-between gap-2">
                  <span className="font-bubbly text-primary-foreground">
                    {getLocalized(course, 'title', lang)}
                  </span>
                  {(progressMap[course.id]?.total ?? 0) > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {t('course.lessonsCompleted', {
                            completed: progressMap[course.id].completed,
                            total: progressMap[course.id].total,
                          })}
                        </span>
                        <span>{progressMap[course.id].percent}%</span>
                      </div>
                      <Progress
                        value={progressMap[course.id].percent}
                        className="h-1.5"
                      />
                    </div>
                  )}
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {t('purchased.continue')}
                  </span>
                </div>

              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
