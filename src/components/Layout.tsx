import { Outlet, useLocation } from 'react-router-dom'
import { Home, Book, BookOpen, User, Layers } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { Navbar } from './navigation/Navbar'
import { Footer } from './navigation/Footer'
import { MobileNavigation } from './navigation/MobileNavigation'

interface NavigationSettings {
  home: boolean
  stories: boolean
  courses: boolean
  games: boolean
  profile: boolean
}

const Layout = () => {
  const { isAuthenticated, user, profile, logout } = useAuth()
  const { t } = useTranslation(['navigation', 'auth', 'misc'])
  const location = useLocation()

  // Fetch navigation settings
  const { data: navigationSettings } = useQuery({
    queryKey: ['appearance-settings', 'home_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('setting_value')
        .eq('setting_key', 'home_page')
        .maybeSingle()

      if (error) {
        logger.warn('Error fetching navigation settings:', error)
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

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const allNavItems = [
    { name: t('navigation:home'), path: '/', icon: Home, key: 'home' },
    {
      name: t('navigation:stories'),
      path: '/stories',
      icon: Book,
      key: 'stories',
    },
    {
      name: t('navigation:courses'),
      path: '/courses',
      icon: Layers,
      key: 'courses',
    },
    {
      name: t('navigation:games'),
      path: '/games',
      icon: BookOpen,
      key: 'games',
    },
    {
      name: t('navigation:profile'),
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
      key: 'profile',
    },
  ]

  // Filter nav items based on navigation settings
  const navItems = allNavItems.filter(item => {
    if (!navigationSettings) return true // Show all if settings not loaded yet
    return navigationSettings[item.key as keyof NavigationSettings] !== false
  })

  return (
    <div className="flex min-h-screen flex-col pb-16 text-foreground md:pb-0">
      <Navbar navItems={navItems} isActive={isActive} />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer navItems={navItems} />
      <MobileNavigation navItems={navItems} isActive={isActive} />
    </div>
  )
}

export default Layout
