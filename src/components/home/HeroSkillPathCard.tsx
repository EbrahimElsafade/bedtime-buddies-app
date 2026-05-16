import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { SkillPathTheme } from './skillPathThemes'

interface HeroSkillPathCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  description?: string
  delay?: number
  theme?: SkillPathTheme
}

const HeroSkillPathCard = ({
  icon,
  title,
  subtitle,
  description,
  delay = 0,
  theme = 'blue-neon',
}: HeroSkillPathCardProps) => {
  return (
    <div
      className={cn(
        'sp-hero-card group flex w-64 items-center gap-3 p-4',
        `sp-theme--${theme}`,
      )}
      style={{
        animation: `floatCard 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Content (text-first in RTL) */}
      <div className="relative z-10 flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-bold text-current drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-current/85">
            <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white/90 align-middle" />
            {subtitle}
          </p>
        )}
        {description && (
          <p className="line-clamp-1 text-xs text-current/70">{description}</p>
        )}
      </div>

      {/* Icon */}
      <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur-sm">
        {icon}
      </div>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}

export default HeroSkillPathCard
