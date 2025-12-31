import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, Crown, Sparkles } from 'lucide-react'

const SubscribeBanner = () => {
  const { t } = useTranslation(['misc', 'subscription'])
  const planPrice = 499

  const features = t('subscription:plans.yearly.features', { returnObjects: true }) as string[]

  return (
    <section className="px-4 py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="font-bubbly text-2xl md:text-3xl text-foreground">
              {t('misc:subscribe.title')}
            </h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>

          <p className="mb-8 text-muted-foreground max-w-2xl mx-auto">
            {t('misc:subscribe.subtitle')}
          </p>

          <Card className="max-w-md mx-auto border-2 border-primary/30 bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {t('subscription:mostPopular')}
                </span>
              </div>
              <CardTitle className="text-xl font-bubbly mt-4 text-foreground">
                {t('subscription:plans.yearly.name')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('subscription:plans.yearly.description')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">{planPrice}</span>
                <span className="text-muted-foreground ms-1">{t('subscription:currency')}</span>
                <span className="text-muted-foreground text-sm"> / {t('subscription:plans.yearly.name')}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3 mb-6 text-start">
                {Array.isArray(features) && features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/profile?tab=subscription" className="block">
                <Button size="lg" className="w-full" variant="default">
                  {t('subscription:subscribeNow')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default SubscribeBanner
