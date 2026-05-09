import { ReactNode } from 'react'

interface SkillPathCardProps {
  icon: ReactNode
  title: string
  description?: string
  progress?: number
  coursesCount?: number
  showDescription?: boolean
}

const SkillPathCard = ({
  icon,
  title,
  description,
  progress = 0,
  coursesCount = 0,
  showDescription = true,
}: SkillPathCardProps) => {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-white/20 hover:shadow-xl">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-500/15 blur-2xl transition-all duration-300 group-hover:scale-150"></div>

      <div className="relative z-10">
        <div className="mb-3 text-3xl">{icon}</div>
        <h3 className="mb-2 font-bold text-slate-700">{title}</h3>
        {showDescription && description && (
          <p className="mb-4 text-sm text-slate-600 line-clamp-2">{description}</p>
        )}

        <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-xs text-slate-600">{coursesCount} courses</p>
      </div>
    </div>
  )
}

export default SkillPathCard
