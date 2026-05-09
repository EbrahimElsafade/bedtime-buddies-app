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
      className="flex w-64 gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20"
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-2xl">{icon}</div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        {description && (
          <p className="line-clamp-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}

export default HeroSkillPathCard
