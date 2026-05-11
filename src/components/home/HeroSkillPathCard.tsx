import { ReactNode } from 'react'

interface HeroSkillPathCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  description?: string
  delay?: number
}

const HeroSkillPathCard = ({
  icon,
  title,
  subtitle,
  description,
  delay = 0,
}: HeroSkillPathCardProps) => {
  return (
    <div
      className="flex w-64 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(15,27,61,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(15,27,61,0.12)]"
      style={{
        animation: `floatCard 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Content (text-first in RTL) */}
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-bold text-[#0F1B3D]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F97316] align-middle me-1.5" />
            {subtitle}
          </p>
        )}
        {description && (
          <p className="line-clamp-1 text-xs text-slate-400">{description}</p>
        )}
      </div>

      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
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
