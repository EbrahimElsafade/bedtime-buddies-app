import { Check, Crown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrencySymbol } from '@/utils/getPlanPrice'
import { PricingCard } from '@/components/ui/PricingCard'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface SubscriptionProfileProps {
  isPremium: boolean
}

export const SubscriptionProfile = ({
  isPremium,
}: SubscriptionProfileProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['subscription', 'meta', 'common'])
  const { countryCode, loading } = useCountry()

  return (
    <div className="space-y-6">
      {isPremium ? (
        // Premium user - show subscription status
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">
              {t('common:mySubscription')}
            </CardTitle>
            <CardDescription className="text-green-700">
              {t('common:premiumPlanDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-green-100 p-4">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  {t('common:premiumPlan')}
                </p>
                <p className="text-sm text-green-700">
                  {t('subscription:plans.yearly.name')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Non-premium user - show subscription offer
        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
            planType="monthly"
            title={t('subscription:plans.monthly.name')}
            description={t('subscription:plans.monthly.description')}
            features={
              Object.values(
                t('subscription:plans.monthly.features', {
                  returnObjects: true,
                }) as string[],
              ) || []
            }
            isLoading={loading}
            countryCode={countryCode}
            periodLabel={`/ ${t('subscription:month')}`}
            currencyLabel={t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
          />
          <PricingCard
            planType="yearly"
            title={t('subscription:plans.yearly.name')}
            description={t('subscription:plans.yearly.description')}
            features={
              Object.values(
                t('subscription:plans.yearly.features', {
                  returnObjects: true,
                }) as string[],
              ) || []
            }
            isPopular={true}
            showMostPopularBadge={true}
            isLoading={loading}
            countryCode={countryCode}
            mostPopularLabel={t('subscription:mostPopular')}
            periodLabel={`/ ${t('subscription:year')}`}
            currencyLabel={t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
          />
        </div>
      )}
    </div>
  )
}
