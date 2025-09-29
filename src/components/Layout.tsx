import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Book, BookOpen, User, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { DalfoonMascot } from './DalfoonMascot'
import { cn } from '@/lib/utils'

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
    <div className="ocean-gradient bubbles-bg flex min-h-screen flex-col pb-16 text-foreground md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/70 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4">
            <DalfoonMascot size="sm" expression="happy" animate={false} />
            <h1 className="font-bubbly text-xl text-accent">
              {t('misc:layout.appName')}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-accent/10 text-accent shadow-md'
                    : 'text-primary hover:bg-primary/10',
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="hidden items-center space-x-2 md:flex">
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    {profile?.parent_name || t('auth:profile')}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/login" className='hidden md:block'>
                <Button variant="link" size="sm">
                  {t('auth:login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden border-primary/20 bg-gradient-to-b from-primary/10 to-white/10 py-6 md:block">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center gap-4">
            {navItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm text-primary hover:text-primary-foreground"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/subscription"
              className="text-coral-DEFAULT text-sm hover:text-coral-dark"
            >
              {t('misc:layout.subscribe')}
            </Link>
          </div>
          <p className="text-xs text-primary">
            © {new Date().getFullYear()} {t('misc:layout.appName')}.{' '}
            {t('misc:layout.copyright')}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-2 flex h-16 items-center justify-around border-t border-primary/20 bg-background px-2 md:hidden">
        {navItems.map(item => {
          const ItemIcon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex w-1/5 flex-col items-center justify-center rounded-lg px-2 py-1',
                isActive(item.path)
                  ? 'text-accent'
                    : 'text-primary',
              )}
            >
              <ItemIcon
                className={cn(
                  'h-5 w-5',
                  isActive(item.path)
                    ? 'text-accent'
                    : 'text-primary',
                )}
              />
              <span className="mt-1 text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Layout
