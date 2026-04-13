import { Check, Crown, Loader } from 'lucide-react'
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
  translationKey?: (key: string) => string
  showMostPopularBadge?: boolean
  mostPopularLabel?: string
  periodLabel?: string
  currencyLabel?: string
}

export const PricingCard = ({
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
}: PricingCardProps) => {
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

  return (
    <Card
      className={`relative mx-auto w-full border-2 ${borderClass} transition-shadow duration-300 ${shadowClass}`}
    >
      {showMostPopularBadge && isPopular && (
        <div className="absolute -top-4 right-4 z-10">
          <Badge className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
            <Crown className="h-3 w-3" />
            {mostPopularLabel}
          </Badge>
        </div>
      )}

      <CardHeader
        className={`pb-2 text-center ${isPopular && showMostPopularBadge ? 'mt-4' : ''}`}
      >
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        {isLoading ? (
          <div className="mx-auto flex h-12 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-primary">{price}</span>
            <span className="ms-1 text-muted-foreground">{displayCurrency}</span>
            <span className="text-sm text-muted-foreground">{period}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6" dir="auto">
        <ul className="space-y-2">
          {Array.isArray(features) &&
            features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <Check className="mr-2 mt-0.5 h-5 w-5 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
        </ul>
      </CardContent>

      <CardFooter className="gap-4">
        <WhatsappSubscribeButton />
      </CardFooter>
    </Card>
  )
}
