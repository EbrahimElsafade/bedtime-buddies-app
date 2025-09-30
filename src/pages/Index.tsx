import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import PricingPopup from '@/components/PricingPopup'
import Hero from '@/components/home/Hero'
import FreeStory from '@/components/home/FreeStory'
import FeaturedStories from '@/components/home/FeaturedStories'
import Features from '@/components/home/Features'
import SubscribeBanner from '@/components/home/SubscribeBanner'
import PopularStories from '@/components/home/PopularStories'
import EntertainmentStories from '@/components/home/EntertainmentStories'
import FeaturedCourses from '@/components/home/FeaturedCourses'
import FunElements from '@/components/home/FunElements'

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
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()

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
        console.error('Error fetching home page settings:', error)
        throw error
      }

      return data?.setting_value as unknown as HomePageSettings
    },
  })

  useEffect(() => {
    document.title = 'Dolphoon - Kids Entertainment'
  }, [])

  // Handle RTL layout for Arabic
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
    <div className="relative flex flex-col">
      {/* Fun floating elements */}
      <FunElements />

      {/* PricingPopup - Making sure it's rendered for non-authenticated users */}
      {/* <PricingPopup /> */}

      {/* Component Sections */}
      <Hero />

      {/* Conditionally render sections based on appearance settings */}
      {homePageSettings?.freeStoryEnabled !== false && <FreeStory />}

      {homePageSettings?.storiesSection !== false && <FeaturedStories />}
      {homePageSettings?.topRated !== false && <PopularStories />}
      {homePageSettings?.specialStory !== false && <EntertainmentStories />}
      {homePageSettings?.courses !== false && <FeaturedCourses />}

      {homePageSettings?.features !== false && <Features />}
      {homePageSettings?.subscribeBanner !== false && <SubscribeBanner />}
    </div>
  )
}

export default Index
