import { Check, Crown, Loader } from 'lucide-react'
import { memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'
import { getCurrencySymbol, getPlanPrice } from '@/utils/getPlanPrice'

interface PricingCardProps {
  planType: 'monthly' | 'yearly'
  title: string
  description: string
  features: string[]
  isPopular?: boolean
  isLoading?: boolean
  countryCode?: string
  showMostPopularBadge?: boolean
  mostPopularLabel?: string
  periodLabel?: string
  currencyLabel?: string
  showButton?: boolean
}

export const PricingCard = memo(function PricingCard({
  planType,
  title,
  description,
  features,
  isPopular = false,
  isLoading = false,
  countryCode = 'US',
  showMostPopularBadge = false,
  mostPopularLabel = 'Most Popular',
  periodLabel = '',
  currencyLabel = '',
  showButton = true,
}: PricingCardProps) {
  const price = getPlanPrice(
    countryCode,
    planType === 'monthly' ? 'monthly' : undefined,
  )
  const currency = getCurrencySymbol(countryCode)
  const displayCurrency = currencyLabel || currency
  const period = periodLabel || (planType === 'monthly' ? '/month' : '/year')
  const borderClass = isPopular ? 'border-primary/30' : 'border-primary/20'
  const shadowClass = isPopular
    ? 'shadow-xl hover:shadow-2xl'
    : 'shadow-lg hover:shadow-xl'
  const ariaLabel = `${title} - ${price}${displayCurrency} ${period}`

  return (
    <Card
      className={`relative mx-auto w-full border-2 ${borderClass} transition-shadow duration-300 ${shadowClass}`}
      role="option"
      aria-selected={isPopular}
      aria-label={ariaLabel}
    >
      {showMostPopularBadge && isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
            <Crown className="h-3 w-3" aria-hidden="true" />
            {mostPopularLabel}
          </Badge>
        </div>
      )}

      <CardHeader
        className={`pb-2 text-center ${isPopular && showMostPopularBadge ? 'mt-4' : ''}`}
      >
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        {isLoading ? (
          <div className="mx-auto flex h-12 items-center justify-center">
            <Loader aria-label="Loading price information" className="animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl md:text-4xl font-bold text-primary">{price}</span>
            <span className="ms-1 text-muted-foreground text-sm md:text-base">{displayCurrency}</span>
            <span className="text-xs md:text-sm text-muted-foreground">{period}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6" dir="auto">
        <ul className="space-y-2" role="list">
          {Array.isArray(features) &&
            features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start" role="listitem">
                <Check className="mr-2 mt-0.5 h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-sm md:text-base">{feature}</span>
              </li>
            ))}
        </ul>
      </CardContent>

      {showButton && (
        <CardFooter className="gap-4">
          <WhatsappSubscribeButton planType={planType} />
        </CardFooter>
      )}
    </Card>
  )
})
