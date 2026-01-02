import { useState } from 'react'
import { Check } from 'lucide-react'
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

interface SubscriptionProfileProps {
  isPremium: boolean
}

export const SubscriptionProfile = ({ isPremium }: SubscriptionProfileProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['subscription', 'meta', 'common'])
  const [isGift, setIsGift] = useState(false)

  const getPlanPrice = () => {
    return 499
  }

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
            <CardTitle className="text-green-900">{t('common:mySubscription')}</CardTitle>
            <CardDescription className="text-green-700">
              {t('common:premiumPlanDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-green-100 p-4">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{t('common:premiumPlan')}</p>
                <p className="text-sm text-green-700">{t('subscription:plans.yearly.name')}</p>
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
            <div
              dir="auto"
              className="flex gap-2 text-start text-3xl font-bold"
            >
              <span>{getPlanPrice()}</span>
              <span>{t('subscription:currency')}</span>
            </div>
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
