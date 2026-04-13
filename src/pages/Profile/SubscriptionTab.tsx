import { useNavigate } from 'react-router-dom'
import { Check, Crown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrencySymbol } from '@/utils/getPlanPrice'
import { PricingCard } from '@/components/ui/PricingCard'

interface SubscriptionTabProps {
  isPremium: boolean
  t: (key: string) => string
}

export const SubscriptionTab = ({ isPremium, t }: SubscriptionTabProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t: tSub } = useTranslation('subscription')
  const { countryCode, loading } = useCountry()

  // If user is premium, show premium status
  if (isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('mySubscription')}</CardTitle>
          <CardDescription>
            {t('manageSubscriptionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-2">
              <span className="text-sm font-medium text-primary">
                {t('premiumPlan')}
              </span>
            </div>
            <p className="text-muted-foreground">
              {t('premiumPlanDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If user is not premium, show subscription options
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('mySubscription')}</CardTitle>
          <CardDescription>
            {t('manageSubscriptionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <div className="mb-4 inline-block rounded-full bg-secondary/50 px-4 py-2">
              <span className="text-sm font-medium">{t('freePlan')}</span>
            </div>
            <p className="text-muted-foreground">{t('freePlanDescription')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <PricingCard
          planType="monthly"
          title={tSub('plans.monthly.name')}
          description={tSub('plans.monthly.description')}
          features={
            Object.values(
              tSub('plans.monthly.features', {
                returnObjects: true,
              }) as string[],
            ) || []
          }
          isLoading={loading}
          countryCode={countryCode}
          periodLabel={`/ ${tSub('month')}`}
          currencyLabel={tSub(`currency.${getCurrencySymbol(countryCode)}`)}
        />
        <PricingCard
          planType="yearly"
          title={tSub('plans.yearly.name')}
          description={tSub('plans.yearly.description')}
          features={
            Object.values(
              tSub('plans.yearly.features', {
                returnObjects: true,
              }) as string[],
            ) || []
          }
          isPopular={true}
          showMostPopularBadge={true}
          isLoading={loading}
          countryCode={countryCode}
          mostPopularLabel={tSub('mostPopular')}
          periodLabel={`/ ${tSub('year')}`}
          currencyLabel={tSub(`currency.${getCurrencySymbol(countryCode)}`)}
        />
      </div>
    </div>
  )
}
