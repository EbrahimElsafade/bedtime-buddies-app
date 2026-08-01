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

interface SubscriptionTabProps {
  isPremium: boolean
  t: (key: string) => string
}

export const SubscriptionTab = ({ isPremium, t }: SubscriptionTabProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

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

    </div>
  )
}
