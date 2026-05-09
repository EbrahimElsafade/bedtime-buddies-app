import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useMemo } from 'react'
import SkillPathCard from '@/components/home/SkillPathCard'
import { useSkillPaths, useSkillPathProgress } from '@/hooks/useSkillPaths'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { Input } from '@/components/ui/input'

const SkillPathsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  
  const { i18n, t } = useTranslation(['skillPaths', 'meta'])
  const lang = i18n.language as 'en' | 'ar' | 'fr'
  const { data: paths = [], isLoading } = useSkillPaths()
  const { data: progressMap } = useSkillPathProgress(paths)

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('search', value)
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const filteredPaths = useMemo(() => {
    return paths.filter(path => {
      const titleMatch = getMultilingualText(path.name, lang, 'en')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const descMatch = getMultilingualText(path.description, lang, 'en')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return titleMatch || descMatch
    })
  }, [paths, lang, searchQuery])

  return (
    <div className="relative min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-8 md:px-4 md:py-12">
      <Helmet>
        <title>{t('skillPaths:skillPaths.title')}</title>
        <meta name="description" content={t('skillPaths:skillPaths.title')} />
      </Helmet>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('skillPaths:skillPaths.title')}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-4 space-y-3 md:mb-6 md:space-y-4 lg:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                type="search"
                placeholder={t('skillPaths:skillPaths.searchPlaceholder') || 'Search skill paths...'}
                className="w-full py-2 ps-10 text-start text-sm md:text-base"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Skill Paths Grid */}
        {isLoading ? (
          <p className="text-muted-foreground">{t('skillPaths:skillPaths.loading')}</p>
        ) : filteredPaths.length === 0 ? (
          <div className="rounded-lg bg-secondary/70 py-8 text-center md:py-12">
            <p className="text-base text-primary-foreground md:text-lg">
              {searchQuery ? t('skillPaths:skillPaths.noResults') || 'No skill paths found' : t('skillPaths:skillPaths.noPathsAvailable')}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPaths.map((path) => {
              const stats = progressMap?.[path.id] ?? { completed: 0, total: path.course_ids.length }
              const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              return (
                <Link key={path.id} to={`/skill-path/${path.id}`}>
                  <SkillPathCard
                    icon={path.icon}
                    title={getMultilingualText(path.name, lang, 'en')}
                    description={getMultilingualText(path.description, lang, 'en')}
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
