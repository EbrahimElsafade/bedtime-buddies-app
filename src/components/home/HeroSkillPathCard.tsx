import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
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
        'sp-hero-card group relative w-64 min-h-[96px] p-4',
        `sp-theme--${theme}`,
      )}
      style={{
        animation: `floatCard 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Decorative background icon — same system as main cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -right-2 z-0 select-none text-[5rem] leading-none rtl:right-auto rtl:-left-2"
        style={{ opacity: 0.5, filter: 'grayscale(100%) brightness(0) invert(1)' }}
      >
        <MaterialIcon name={icon} className="text-[5rem]" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col gap-1 pr-12 rtl:pr-0 rtl:pl-12">
        <h3 className="text-sm font-bold text-current drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-current/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white/90 align-middle" />
            {subtitle}
          </p>
        )}
        {description && (
          <p className="line-clamp-1 text-xs text-current/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            {description}
          </p>
        )}
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
