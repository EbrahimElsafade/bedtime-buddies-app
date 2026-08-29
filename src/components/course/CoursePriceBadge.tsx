import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { CoursePrice } from '@/components/course/CoursePrice'
import { cn } from '@/lib/utils'

interface CoursePriceBadgeProps {
  priceEgp?: number
  priceUsd?: number
  className?: string
}

/** Price badge shown on course cards in place of the old "Premium" tag. */
export const CoursePriceBadge = ({ priceEgp, priceUsd, className }: CoursePriceBadgeProps) => {
  const { t } = useTranslation('courses')

  return (
    <Badge
      className={cn(
        'gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500',
        className,
      )}
    >
      <CoursePrice
        priceEgp={priceEgp}
        priceUsd={priceUsd}
        className="text-sm leading-none text-white"
      />
      <span className="text-[10px] leading-none text-white/80">
        {t('purchase.oneTime')}
      </span>
    </Badge>
  )
}
