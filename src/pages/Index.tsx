import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import SkillPaths from '@/components/home/SkillPaths'
import Features from '@/components/home/Features'
import SubscribeBanner from '@/components/home/SubscribeBanner'
import FeaturedCourses from '@/components/home/FeaturedCourses'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'

const Index = () => {
  const { profile } = useAuth()
  const { i18n, t } = useTranslation(['meta'])

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
          { label: 'درس تفاعلي', value: '+200' },
          { label: 'مسار تعليمي', value: '12' },
          { label: 'الفئة العمرية', value: '8-16' },
          { label: 'السعر في السنة', value: '$499.99' },
        ]}
      />

      <FeaturedCourses />

      <SkillPaths />

      <Features />

      {!profile?.is_premium && <SubscribeBanner />}
    </div>
  )
}

export default Index
