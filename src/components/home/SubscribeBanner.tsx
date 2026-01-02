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
import { Check, Crown, Sparkles } from 'lucide-react'
import { Badge } from '../ui/badge'
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'

const SubscribeBanner = () => {
  const { t } = useTranslation(['misc', 'subscription'])
  const planPrice = 499

  const features = t('subscription:plans.yearly.features', {
    returnObjects: true,
  }) as string[]

  return (
    <section className="px-4 py-12 text-primary-foreground">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
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

          <Card className="mx-auto max-w-md border-2 border-primary/30 bg-card/80 shadow-xl backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl">
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
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">
                  {planPrice}
                </span>
                <span className="ms-1 text-muted-foreground">
                  {t('subscription:currency')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {' '}
                  / {t('subscription:plans.yearly.name')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="mb-6 space-y-3 text-start">
                {Array.isArray(features) &&
                  features.map((feature, index) => (
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
    </section>
  )
}

export default SubscribeBanner
