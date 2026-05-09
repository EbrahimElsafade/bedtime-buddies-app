import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import SkillPathCard from '@/components/home/SkillPathCard'
import { useSkillPaths, useSkillPathProgress } from '@/hooks/useSkillPaths'
import { getMultilingualText } from '@/utils/multilingualUtils'

const SkillPathsPage = () => {
  const { i18n, t } = useTranslation(['skillPaths'])
  const { data: paths = [], isLoading } = useSkillPaths()
  const { data: progressMap } = useSkillPathProgress(paths)

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <Helmet>
        <title>{t('skillPaths:skillPaths.title')}</title>
      </Helmet>
      <div className="container mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t('skillPaths:skillPaths.title')}</h1>
        {isLoading ? (
          <p className="text-muted-foreground">{t('skillPaths:skillPaths.loading')}</p>
        ) : paths.length === 0 ? (
          <p className="text-muted-foreground">{t('skillPaths:skillPaths.noPathsAvailable')}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => {
              const stats = progressMap?.[path.id] ?? { completed: 0, total: path.course_ids.length }
              const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              return (
                <Link key={path.id} to={`/skill-path/${path.id}`}>
                  <SkillPathCard
                    icon={path.icon}
                    title={getMultilingualText(path.name, i18n.language, 'en')}
                    description={getMultilingualText(path.description, i18n.language, 'en')}
                    progress={progress}
                    coursesCount={path.course_ids.length}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SkillPathsPage
