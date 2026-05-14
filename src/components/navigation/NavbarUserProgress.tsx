import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { useGamification } from '@/hooks/useGamification'
import { cn } from '@/lib/utils'

const MILESTONES = [5, 10, 25, 50, 100]

interface NavbarUserProgressProps {
  className?: string
  compact?: boolean
}

export const NavbarUserProgress = ({
  className,
  compact = false,
}: NavbarUserProgressProps) => {
  const { stats, isLoading } = useGamification()
  const { t } = useTranslation(['common'])

  if (isLoading) return null

  const totalPoints = stats.totalPoints
  const nextMilestone =
    MILESTONES.find(m => totalPoints < m) ?? MILESTONES[MILESTONES.length - 1]
  const prevMilestone =
    [...MILESTONES].reverse().find(m => totalPoints >= m) ?? 0
  const range = nextMilestone - prevMilestone
  const progress =
    totalPoints >= MILESTONES[MILESTONES.length - 1]
      ? 100
      : Math.min(
          100,
          Math.max(0, ((totalPoints - prevMilestone) / range) * 100),
        )
  const achievements = stats.unlockedMilestones.length

  return (
    <Link
      to="/profile?tab=finished"
      className={cn(
        'group flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-sm',
        className,
      )}
      aria-label={t('common:myProgress', { defaultValue: 'My progress' })}
    >
      <Trophy className="h-4 w-4 shrink-0 text-primary" />
      <div
        className={cn(
          'flex flex-col gap-0.5',
          compact ? 'w-16' : 'w-24',
        )}
      >
        <div className="flex items-center justify-between text-[10px] font-medium leading-none text-primary">
          <span>{Math.round(progress)}%</span>
          <span className="text-muted-foreground">
            {achievements}/{MILESTONES.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </Link>
  )
}
