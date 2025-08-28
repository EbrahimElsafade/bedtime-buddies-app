import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Moon,
  Sun,
  Home,
  Book,
  BookOpen,
  User,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const location = useLocation()

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
    { name: t('nav.courses'), path: '/courses', icon: Layers, key: 'courses' },
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
    <div className="nightsky-gradient stars-bg flex min-h-screen flex-col pb-16 dark:text-white md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-900/20 bg-white/70 backdrop-blur-lg dark:bg-nightsky/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-dream-DEFAULT mr-2 flex h-10 w-10 items-center justify-center rounded-full">
              <Moon className="h-6 w-6 animate-float text-black dark:text-white" />
            </div>
            <h1 className="text-dream-DEFAULT font-bubbly text-xl">
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
                    ? 'bg-dream-DEFAULT/30 text-dream-DEFAULT shadow-md dark:text-white'
                    : 'text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10',
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
              aria-label={t('misc:accessibility.toggleTheme')}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <div className="hidden items-center space-x-2 md:flex">
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-dream-DEFAULT dark:text-white"
                  >
                    {profile?.parent_name || t('auth:profile')}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-dream-DEFAULT dark:text-white"
                >
                  {t('auth:logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden items-center space-x-2 md:flex">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-dream-DEFAULT dark:text-white"
                  >
                    {t('auth:login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    {t('auth:signUp')}
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden border-t border-purple-900/20 bg-white/10 py-6 dark:bg-nightsky/50 md:block">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center gap-4">
            {navItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-dream-DEFAULT text-sm hover:text-dream-dark dark:text-muted-foreground dark:hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/subscription"
              className="text-moon-DEFAULT text-sm hover:text-moon-dark"
            >
              {t('misc:layout.subscribe')}
            </Link>
          </div>
          <p className="text-dream-DEFAULT text-xs dark:text-muted-foreground">
            © {new Date().getFullYear()} {t('misc:layout.appName')}.{' '}
            {t('misc:layout.copyright')}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-purple-900/20 bg-white px-2 dark:bg-nightsky-light md:hidden">
        {navItems.map(item => {
          const ItemIcon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex w-1/5 flex-col items-center justify-center rounded-lg px-2 py-1',
                isActive(item.path)
                  ? 'text-dream-DEFAULT bg-dream-default/10'
                  : 'text-dream-DEFAULT/70 dark:text-white/70',
              )}
            >
              <ItemIcon
                className={cn(
                  'h-5 w-5',
                  isActive(item.path)
                    ? 'text-dream-DEFAULT'
                    : 'text-dream-DEFAULT/70 dark:text-white/70',
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
