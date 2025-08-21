
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Header } from './layout/Header'
import { MobileMenu } from './layout/MobileMenu'
import { Footer } from './layout/Footer'
import { BottomNavigation } from './layout/BottomNavigation'

interface NavigationSettings {
  home: boolean
  stories: boolean
  courses: boolean
  games: boolean
  profile: boolean
}

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Fetch navigation settings
  const { data: navigationSettings } = useQuery({
    queryKey: ['appearance-settings', 'navigation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('setting_value')
        .eq('setting_key', 'navigation')
        .maybeSingle()

      if (error) {
        console.error('Error fetching navigation settings:', error)
        // Return default settings if error
        return {
          home: true,
          stories: true,
          courses: true,
          games: true,
          profile: true,
        }
      }

      return (
        (data?.setting_value as unknown as NavigationSettings) || {
          home: true,
          stories: true,
          courses: true,
          games: true,
          profile: true,
        }
      )
    },
  })

  // Check for system preferred color scheme on initial load
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.classList.add('dark')
      setIsDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    setIsDarkMode(!isDarkMode)
  }

  // Handle scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMenuOpen])

  return (
    <div className="nightsky-gradient stars-bg flex min-h-screen flex-col pb-16 dark:text-white md:pb-0">
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navigationSettings={navigationSettings}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigationSettings={navigationSettings}
      />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer navigationSettings={navigationSettings} />

      <BottomNavigation navigationSettings={navigationSettings} />
    </div>
  )
}

export default Layout
