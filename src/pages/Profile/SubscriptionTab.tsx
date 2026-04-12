import { useNavigate } from 'react-router-dom'
import { Check, Loader } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

      <Card className="overflow-hidden border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl">
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
          {/* <Button
            variant="accent"
            className="w-full"
            onClick={handleSubscribe}
          >
            {tSub('subscribeNow')}
          </Button> */}

          <WhatsappSubscribeButton />
        </CardFooter>
      </Card>
    </div>
  )
}
