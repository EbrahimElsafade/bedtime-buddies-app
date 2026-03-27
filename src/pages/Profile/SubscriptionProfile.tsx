import { useState } from 'react'
import { Check, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrencySymbol, getPlanPrice } from '@/utils/getPlanPrice'

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

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setTimeout(() => {
      toast.success(t('subscription:subscribeNow'))
    }, 1500)
  }

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
        <Card className="mx-auto overflow-hidden border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('subscription:plans.yearly.name')}
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
            <CardDescription>
              {t('subscription:plans.yearly.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6" dir="auto">
            <ul className="space-y-2">
              {Object.values(
                t('subscription:plans.yearly.features', {
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
              {t('subscription:subscribeNow')}
            </Button> */}

            <WhatsappSubscribeButton />
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
