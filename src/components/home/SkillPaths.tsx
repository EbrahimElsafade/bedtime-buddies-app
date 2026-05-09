import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import SkillPathCard from './SkillPathCard'
import { useSkillPaths, useSkillPathProgress } from '@/hooks/useSkillPaths'
import { getMultilingualText } from '@/utils/multilingualUtils'

const SkillPaths = () => {
  const { i18n, t } = useTranslation('skillPaths')
  const { data: paths = [], isLoading } = useSkillPaths()
  const top3 = paths.slice(0, 3)
  const { data: progressMap } = useSkillPathProgress(top3)

  if (isLoading || top3.length === 0) return null

  return (
    <section className="relative bg-background/70 px-4 py-12">
      <div className="container mx-auto">
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h2 className="text-lg text-primary-foreground md:text-3xl">
            {t('skillPaths:skillPaths.title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {top3.map((path) => {
            const stats = progressMap?.[path.id] ?? { completed: 0, total: path.course_ids.length }
            const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            return (
              <Link key={path.id} to={`/skill-path/${path.id}`}>
                <SkillPathCard
                  icon={path.icon}
                  title={getMultilingualText(path.name, i18n.language, 'en')}
                  showDescription={false}
                  progress={progress}
                  coursesCount={path.course_ids.length}
                />
              </Link>
            )
          })}
        </div>

        {paths.length > 3 && (
          <div className="mt-4 flex items-center justify-center">
            <Link to="/skill-paths">
              <Button variant="accent">{t('skillPaths:skillPaths.title')} ←</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default SkillPaths
