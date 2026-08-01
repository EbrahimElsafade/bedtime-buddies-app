import { useTranslation } from 'react-i18next'
import { useCountry } from '@/contexts/CountryContext'
import { formatCoursePrice } from '@/utils/getCoursePrice'
import { cn } from '@/lib/utils'

interface CoursePriceProps {
  priceEgp?: number
  className?: string
  withLabel?: boolean
}

export const CoursePrice = ({ priceEgp, className, withLabel }: CoursePriceProps) => {
  const { t } = useTranslation('courses')
  const { countryCode } = useCountry()
  const price = formatCoursePrice(priceEgp, countryCode)

  if (withLabel) {
    return (
      <div className={cn('grid gap-1', className)}>
        <span className="text-xs uppercase tracking-wide text-primary-foreground/70">
          {t('purchase.priceLabel')}
        </span>
        <span className="font-bubbly text-2xl text-primary-foreground">{price}</span>
      </div>
    )
  }

  return (
    <span className={cn('font-bubbly text-lg text-primary-foreground', className)}>
      {price}
    </span>
  )
}
