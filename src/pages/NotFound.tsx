import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

const NotFound = () => {
  const { t } = useTranslation(['notFound', 'misc', 'meta'])

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <Helmet>
        <title>{t('meta:titles.notFound')}</title>
        <meta name="description" content={t('meta:descriptions.notFound')} />
        <meta property="og:title" content={t('meta:titles.notFound')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.notFound')}
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary">
          <span className="text-6xl">😴</span>
        </div>
        <h1 className="mb-4 font-bubbly text-4xl md:text-5xl">{t('title')}</h1>
        <p className="mb-8 text-xl text-muted-foreground">{t('message')}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/">
            <Button variant="default">{t('returnHome')}</Button>
          </Link>
          <Link to="/stories">
            <Button variant="outline">{t('browseStories')}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
