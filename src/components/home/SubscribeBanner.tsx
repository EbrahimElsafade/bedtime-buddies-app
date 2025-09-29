import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

const SubscribeBanner = () => {
  const { t } = useTranslation('misc')

  return (
    <section className="bg-primary/10 px-4 py-12 text-primary-foreground">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-bubbly text-2xl md:text-3xl">
            {t('subscribe.title')}
          </h2>

          <p className="mb-6">{t('subscribe.subtitle')}</p>

          <Link to="/subscription">
            <Button size="lg" variant="accent">
              {t('subscribe.button')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SubscribeBanner
