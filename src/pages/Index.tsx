import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import SkillPaths from '@/components/home/SkillPaths'
import Features from '@/components/home/Features'
import SubscribeBanner from '@/components/home/SubscribeBanner'
import FeaturedCourses from '@/components/home/FeaturedCourses'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'

interface HomePageSettings {
  freeStory: string
  freeStoryEnabled: boolean
  storiesSection: boolean
  topRated: boolean
  courses: boolean
  specialStory: boolean
  features: boolean
  subscribeBanner: boolean
}

const Index = () => {
  const {
    //  isAuthenticated,
    profile,
  } = useAuth()

  const { i18n, t } = useTranslation(['meta'])

  // Fetch home page appearance settings
  const { data: homePageSettings } = useQuery({
    queryKey: ['appearance-settings', 'home_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('setting_value')
        .eq('setting_key', 'home_page')
        .maybeSingle()

      if (error) {
        logger.error('Error fetching home page settings:', error)
        throw error
      }

      return data?.setting_value as unknown as HomePageSettings
    },
  })

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

      {/* hide subscribe banner when user already has premium subscription */}
      {!profile?.is_premium && <SubscribeBanner />}
    </div>
  )
}

export default Index
