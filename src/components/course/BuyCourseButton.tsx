import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import { formatCoursePrice } from '@/utils/getCoursePrice'

const WHATSAPP_NUMBER = '201036443209'

interface BuyCourseButtonProps {
  courseTitle: string
  priceEgp?: number
  className?: string
  variant?: 'default' | 'accent' | 'secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  showPrice?: boolean
  label?: string
}

/**
 * Opens WhatsApp with a course-specific purchase message.
 * The course name (and displayed price) are always included.
 */
export const BuyCourseButton = ({
  courseTitle,
  priceEgp,
  className,
  variant = 'accent',
  size = 'default',
  showPrice = false,
  label,
}: BuyCourseButtonProps) => {
  const { t } = useTranslation('courses')
  const { countryCode } = useCountry()
  const price = formatCoursePrice(priceEgp, countryCode)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const message = t('purchase.whatsappMessage', {
      course: courseTitle,
      price,
    })
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`,
      '_blank',
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      <span>
        {label || t('purchase.buy')}
        {showPrice ? ` · ${price}` : ''}
      </span>
    </Button>
  )
}
