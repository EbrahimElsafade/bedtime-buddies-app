import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Check, Crown, Loader, Sparkles } from 'lucide-react'
import { Badge } from '../ui/badge'
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrencySymbol, getPlanPrice } from '@/utils/getPlanPrice'

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
            {/* Monthly Plan */}
            <Card className="mx-auto w-full border-2 border-primary/20 bg-card/80 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="font-bubbly text-xl text-foreground">
                  {t('subscription:plans.monthly.name')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('subscription:plans.monthly.description')}
                </CardDescription>
                {loading ? (
                  <div className="mx-auto flex h-12 items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {getPlanPrice(countryCode, 'monthly')}
                    </span>
                    <span className="ms-1 text-muted-foreground">
                      {t(
                        `subscription:currency.${getCurrencySymbol(countryCode)}`,
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {t('subscription:month')}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="mb-6 space-y-3 text-start">
                  {Array.isArray(monthlyFeatures) &&
                    monthlyFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>

                <WhatsappSubscribeButton />
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="relative mx-auto w-full border-2 border-primary/30 bg-card/80 shadow-xl backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl">
              <CardHeader className="relative pb-2 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
                    <Crown className="h-3 w-3" />
                    {t('subscription:mostPopular')}
                  </Badge>
                </div>
                <CardTitle className="mt-4 font-bubbly text-xl text-foreground">
                  {t('subscription:plans.yearly.name')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('subscription:plans.yearly.description')}
                </CardDescription>
                {loading ? (
                  <div className="mx-auto flex h-12 items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {getPlanPrice(countryCode)}
                    </span>
                    <span className="ms-1 text-muted-foreground">
                      {t(
                        `subscription:currency.${getCurrencySymbol(countryCode)}`,
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {t('subscription:year')}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="mb-6 space-y-3 text-start">
                  {Array.isArray(yearlyFeatures) &&
                    yearlyFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>

                <WhatsappSubscribeButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubscribeBanner
