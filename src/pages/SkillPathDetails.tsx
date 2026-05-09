import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { BookOpen, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSkillPath, useSkillPathProgress } from '@/hooks/useSkillPaths'
import { useCoursesData } from '@/hooks/useCourseData'
import { getLocalized } from '@/utils/getLocalized'
import { getImageUrl } from '@/utils/imageUtils'
import { getMultilingualText } from '@/utils/multilingualUtils'

const SkillPathDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { i18n, t } = useTranslation(['misc', 'courses', 'premium'])
  const lang = i18n.language as 'en' | 'ar' | 'fr'
  const { data: path, isLoading } = useSkillPath(id)
  const { data: allCourses = [] } = useCoursesData()
  const { data: progressMap } = useSkillPathProgress(path ? [path] : undefined)

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }
  if (!path) {
    return <div className="container mx-auto p-6">Skill path not found.</div>
  }

  const courses = path.course_ids
    .map((cid) => allCourses.find((c) => c.id === cid))
    .filter(Boolean) as typeof allCourses
  const stats = progressMap?.[path.id] ?? { completed: 0, total: path.course_ids.length }
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const title = getMultilingualText(path.name, lang, 'en')
  const description = getMultilingualText(path.description, lang, 'en')

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <Helmet>
        <title>{title} - Skill Path</title>
      </Helmet>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="text-5xl">{path.icon}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {stats.completed} / {stats.total} courses
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold">Courses</h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">No courses in this skill path yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="story-card relative z-10 grid h-full cursor-pointer gap-4 overflow-hidden border-primary/20 bg-secondary/70 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="relative aspect-[3/2]">
                    <img
                      src={getImageUrl(course.coverImagePath)}
                      alt={getLocalized(course, 'title', lang)}
                      className="h-full w-full object-cover"
                    />
                    {course.is_free ? (
                      <Badge className="absolute left-2 top-2 bg-green-500">{t('courses:free.tag')}</Badge>
                    ) : (
                      <Badge className="absolute left-2 top-2 bg-gradient-to-r from-purple-500 to-pink-500">
                        {t('premium:tag')}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="grid gap-2 py-0">
                    <CardTitle className="text-lg text-primary-foreground">
                      {getLocalized(course, 'title', lang)}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-primary-foreground">
                      {getLocalized(course, 'description', lang)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-primary-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> {course.lessons}
                    </span>
                    {course.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {Math.floor(course.duration / 60)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SkillPathDetails
