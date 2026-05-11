interface StatItem {
  label: string
  value: string
}

interface StatsBarProps {
  stats: StatItem[]
}

const StatsBar = ({ stats }: StatsBarProps) => {
  return (
    <div className="bg-[#0F1B3D]">
      <div className="container mx-auto px-4">
        <div className="grid gap-0 py-10 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-2 border-white/10 px-4 py-4 sm:py-0 md:border-s md:first:border-s-0"
            >
              <div className="text-center text-3xl font-extrabold text-[#F97316] md:text-4xl">
                {stat.value}
              </div>
              <p className="text-center text-xs text-white/80 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsBar
