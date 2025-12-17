import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type PlanType = 'monthly' | 'yearly'

const Subscription = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['subscription', 'meta'])
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly')
  const [isGift, setIsGift] = useState(false)

  const planIds: PlanType[] = ['monthly', 'yearly']

  const getPlanPrice = (planId: PlanType) => {
    const prices = {
      monthly: 10,
      yearly: 100,
    }
    return prices[planId]
  }

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setTimeout(() => {
      toast.success(t('subscribeNow'))
    }, 1500)
  }

  const handleWhatsappSubscribe = () => {
    const whatsappNumber = '00000000000'
    const message = encodeURIComponent(
      'Hi, I want to subscribe to Dolphoon premium',
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="h-[82.7svh] bg-gradient-to-b from-primary/25 to-primary/10 px-4 py-12">
      <Helmet>
        <title>{t('meta:titles.subscription')}</title>
        <meta
          name="description"
          content={t('meta:descriptions.subscription')}
        />
        <meta property="og:title" content={t('meta:titles.subscription')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.subscription')}
        />
      </Helmet>

      <div className="container mx-auto max-w-5xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('title')}
          </h1>
        </div>

        <Tabs
          defaultValue={selectedPlan}
          value={selectedPlan}
          onValueChange={value => setSelectedPlan(value as PlanType)}
          className="mb-8"
        >
          <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto p-1 md:mb-6 lg:mb-8">
            {planIds.map(planId => (
              <TabsTrigger key={planId} value={planId}>
                {t(`plans.${planId}.name`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {planIds.map(planId => (
            <TabsContent key={planId} value={planId}>
              <Card className="mx-auto overflow-hidden border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {t(`plans.${planId}.name`)}
                  </CardTitle>
                  <div
                    dir="auto"
                    className="flex gap-2 text-start text-3xl font-bold"
                  >
                    <span>{getPlanPrice(planId)}</span>
                    <span>{t('currency')}</span>
                  </div>
                  <CardDescription>
                    {t(`plans.${planId}.description`)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6" dir='auto'>
                  <ul className="space-y-2">
                    {Object.values(
                      t(`plans.${planId}.features`, {
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
                  <Button
                    variant="accent"
                    className="w-full"
                    onClick={handleSubscribe}
                  >
                    {t('subscribeNow')}
                  </Button>

                  <Button
                    className="w-full bg-green-800"
                    onClick={handleWhatsappSubscribe}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 175.216 175.552"
                    >
                      <defs>
                        <linearGradient
                          id="b"
                          x1="85.915"
                          x2="86.535"
                          y1="32.567"
                          y2="137.092"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#57d163" />
                          <stop offset="1" stop-color="#23b33a" />
                        </linearGradient>
                        <filter
                          id="a"
                          width="1.115"
                          height="1.114"
                          x="-.057"
                          y="-.057"
                          color-interpolation-filters="sRGB"
                        >
                          <feGaussianBlur stdDeviation="3.531" />
                        </filter>
                      </defs>
                      <path
                        fill="#b3b3b3"
                        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
                        filter="url(#a)"
                      />
                      <path
                        fill="#fff"
                        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
                      />
                      <path
                        fill="url(#linearGradient1780)"
                        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
                      />
                      <path
                        fill="url(#b)"
                        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
                      />
                      <path
                        fill="#fff"
                        fill-rule="evenodd"
                        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
                      />
                    </svg>

                    <span>{t('subscribeViaWhatsapp')}</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default Subscription
