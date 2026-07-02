import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import SkillPaths from '@/components/home/SkillPaths'
import SubscribeBanner from '@/components/home/SubscribeBanner'
import FeaturedCourses from '@/components/home/FeaturedCourses'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'
import { isMembershipActive } from '@/utils/membership'

const Index = () => {
  const { profile } = useAuth()
  const { i18n, t } = useTranslation(['meta', 'misc'])

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = i18n.language
    }
  }, [i18n.language])

  return (
    <div className="relative flex flex-col bg-gradient-to-b from-primary/25 to-primary/10">
      <Helmet>
        <title>{t('meta:titles.home')}</title>
        <meta name="description" content={t('meta:descriptions.home')} />
        <meta property="og:title" content={t('meta:titles.home')} />
        <meta property="og:description" content={t('meta:descriptions.home')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.origin} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Dolphoon',
            url: window.location.origin,
            logo: `${window.location.origin}/icons/apple-touch-icon.png`,
            sameAs: [],
          })}
        </script>
      </Helmet>

      <Hero />

      <StatsBar
        stats={[
          { label: t('misc:stats.lessonsLabel'), value: t('misc:stats.lessonsValue') },
          { label: t('misc:stats.pathsLabel'), value: t('misc:stats.pathsValue') },
          { label: t('misc:stats.ageLabel'), value: t('misc:stats.ageValue') },
          { label: t('misc:stats.priceLabel'), value: t('misc:stats.priceValue') },
        ]}
      />

      <SkillPaths />

      <FeaturedCourses />

      {!profile?.is_premium && <SubscribeBanner />}
    </div>
  )
}

export default Index
