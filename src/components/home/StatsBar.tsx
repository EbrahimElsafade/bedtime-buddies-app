interface StatItem {
  label: string
  value: string
}

interface StatsBarProps {
  stats: StatItem[]
}

const StatsBar = ({ stats }: StatsBarProps) => {
  return (
    <div className="border-y border-white/50 bg-white/5 backdrop-blur-xl">
      <div className="container mx-auto">
        <div className="grid gap-0 py-8 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center border-x border-white/50 px-4 py-4 first:border-l-0 sm:py-0"
            >
              <div className="bg-gradient-to-l text-center from-accent to-black/15 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                {stat.value}
                <p className="mt-1 text-xs  sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsBar
