import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { SkillPathTheme } from './skillPathThemes'

interface SkillPathCardProps {
  icon: ReactNode
  title: string
  description?: string
  progress?: number
  coursesCount?: number
  showDescription?: boolean
  theme?: SkillPathTheme
}

const SkillPathCard = ({
  icon,
  title,
  description,
  progress = 0,
  coursesCount = 0,
  showDescription = true,
  theme = 'blue-neon',
}: SkillPathCardProps) => {
  const { t } = useTranslation('skillPaths')

  return (
    <div className={cn('sp-card group h-full p-6', `sp-theme--${theme}`)}>
      <div className="relative z-10">
        <div className="mb-3 text-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">{icon}</div>
        <h3 className="mb-2 font-bold text-current">{title}</h3>
        {showDescription && description && (
          <p className="mb-4 line-clamp-2 text-sm text-current/80">{description}</p>
        )}

        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/60 shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-current/80">
          {coursesCount} {t('skillPaths:skillPaths.courses')}
        </p>
      </div>
    </div>
  )
}

export default SkillPathCard
