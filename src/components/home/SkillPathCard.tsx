import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
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
    <div
      className={cn(
        'sp-card group relative h-full min-h-[180px] p-6',
        `sp-theme--${theme}`,
      )}
    >
      {/* Decorative background icon — emerges from lower area of the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 -right-4 z-0 select-none text-[8rem] leading-none grayscale rtl:-right-auto rtl:-left-4"
        style={{ opacity: 0.5, filter: 'grayscale(100%) brightness(0) invert(1)' }}
      >
        <MaterialIcon name={icon} className="text-[8rem]" />
      </div>

      <div className="relative z-10">
        <h3 className="mb-2 font-bold text-current drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {title}
        </h3>
        {showDescription && description && (
          <p className="mb-4 line-clamp-2 text-sm text-current/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            {description}
          </p>
        )}

        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/60 shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-current/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
          {coursesCount} {t('skillPaths:skillPaths.courses')}
        </p>
      </div>
    </div>
  )
}

export default SkillPathCard
