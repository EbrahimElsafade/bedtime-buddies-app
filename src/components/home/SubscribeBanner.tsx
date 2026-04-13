import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrencySymbol } from '@/utils/getPlanPrice'
import { PricingCard } from '../ui/PricingCard'

const SubscribeBanner = () => {
  const { t } = useTranslation(['misc', 'subscription'])
  const { countryCode, loading } = useCountry()

  const yearlyFeatures = t('subscription:plans.yearly.features', {
    returnObjects: true,
  }) as string[]
  const monthlyFeatures = t('subscription:plans.monthly.features', {
    returnObjects: true,
  }) as string[]

  return (
    <section className="px-4 py-12 text-primary-foreground">
      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 animate-pulse text-primary" />
            <h2 className="font-bubbly text-2xl text-foreground md:text-3xl">
              {t('misc:subscribe.title')}
            </h2>
            <Sparkles className="h-6 w-6 animate-pulse text-primary" />
          </div>

          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {t('misc:subscribe.subtitle')}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <PricingCard
              planType="monthly"
              title={t('subscription:plans.monthly.name')}
              description={t('subscription:plans.monthly.description')}
              features={monthlyFeatures}
              isLoading={loading}
              countryCode={countryCode}
              periodLabel={`/ ${t('subscription:month')}`}
              currencyLabel={t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
            />
            <PricingCard
              planType="yearly"
              title={t('subscription:plans.yearly.name')}
              description={t('subscription:plans.yearly.description')}
              features={yearlyFeatures}
              isPopular={true}
              showMostPopularBadge={true}
              isLoading={loading}
              countryCode={countryCode}
              mostPopularLabel={t('subscription:mostPopular')}
              periodLabel={`/ ${t('subscription:year')}`}
              currencyLabel={t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubscribeBanner
