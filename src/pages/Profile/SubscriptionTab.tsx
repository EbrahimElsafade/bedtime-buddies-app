import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SubscriptionTabProps {
  isPremium: boolean
  t: (key: string) => string
}

export const SubscriptionTab = ({ isPremium, t }: SubscriptionTabProps) => {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('mySubscription')}</CardTitle>
        <CardDescription>{t('manageSubscriptionDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-6 text-center">
          <div className="mb-4 inline-block rounded-full bg-secondary/50 px-4 py-2">
            <span className="text-sm font-medium">
              {isPremium ? t('premiumPlan') : t('freePlan')}
            </span>
          </div>

          {isPremium ? (
            <p className="mb-6 text-muted-foreground">
              {t('premiumPlanDescription')}
            </p>
          ) : (
            <p className="mb-6 text-muted-foreground">
              {t('freePlanDescription')}
            </p>
          )}

          {!isPremium && (
            <Button
              onClick={() => navigate('/subscription')}
            >
              {t('upgradeToPremium')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
