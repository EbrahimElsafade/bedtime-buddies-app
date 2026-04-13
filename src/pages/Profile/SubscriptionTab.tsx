import { useNavigate } from 'react-router-dom'
import { Check, Loader, Crown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'
import { getCurrencySymbol, getPlanPrice } from '@/utils/getPlanPrice'
import { useCountry } from '@/contexts/CountryContext'

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
        {/* Monthly Plan Card */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">
              {tSub('plans.monthly.name')}
            </CardTitle>
            {loading ? (
              <div className="mx-auto flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-primary">
                  {getPlanPrice(countryCode, 'monthly')}
                </span>
                <span className="ms-1 text-muted-foreground">
                  {t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {t('subscription:month')}
                </span>
              </div>
            )}
            <CardDescription>{tSub('plans.monthly.description')}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6" dir="auto">
            <ul className="space-y-2">
              {Object.values(
                tSub('subscription:plans.monthly.features', {
                  returnObjects: true,
                }) as string[],
              ).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-5 w-5 text-primary-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="gap-4">
            <WhatsappSubscribeButton />
          </CardFooter>
        </Card>

        {/* Yearly Plan Card */}
        <Card className="relative overflow-hidden border-2 border-primary/30">
          <div className="absolute -top-4 right-4">
            <Badge className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
              <Crown className="h-3 w-3" />
              {t('subscription:mostPopular')}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="mt-4 text-2xl">
              {tSub('plans.yearly.name')}
            </CardTitle>
            {loading ? (
              <div className="mx-auto flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-primary">
                  {getPlanPrice(countryCode)}
                </span>
                <span className="ms-1 text-muted-foreground">
                  {t(`subscription:currency.${getCurrencySymbol(countryCode)}`)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {t('subscription:year')}
                </span>
              </div>
            )}
            <CardDescription>{tSub('plans.yearly.description')}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6" dir="auto">
            <ul className="space-y-2">
              {Object.values(
                tSub('subscription:plans.yearly.features', {
                  returnObjects: true,
                }) as string[],
              ).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-5 w-5 text-primary-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="gap-4">
            <WhatsappSubscribeButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
