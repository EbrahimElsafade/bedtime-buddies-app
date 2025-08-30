import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Moon,
  Sun,
  Menu,
  X,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showIOSPWATest, setShowIOSPWATest] = useState(false)
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

  const triggerIOSPWATest = () => {
    setShowIOSPWATest(true)
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // For testing: if menu is closed, trigger iOS PWA popup first
                if (!isMenuOpen) {
                  triggerIOSPWATest()
                }
                setIsMenuOpen(!isMenuOpen)
              }}
              className="rounded-full md:hidden"
              aria-label={t('misc:accessibility.menu')}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 overflow-y-auto bg-white/90 backdrop-blur-lg dark:bg-nightsky/95 md:hidden">
            <nav className="flex flex-col space-y-3 p-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'rounded-md px-4 py-3 text-center text-lg font-medium',
                    isActive(item.path)
                      ? 'bg-dream-DEFAULT text-white shadow-md'
                      : 'text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10',
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-dream-DEFAULT hover:bg-dream-DEFAULT/10 rounded-md px-4 py-3 text-center text-lg font-medium dark:text-white dark:hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:profile')}
                  </Link>
                  <button
                    className="text-dream-DEFAULT hover:bg-dream-DEFAULT/10 w-full rounded-md px-4 py-3 text-center text-lg font-medium dark:text-white dark:hover:bg-white/10"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                  >
                    {t('auth:logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-dream-DEFAULT hover:bg-dream-DEFAULT/10 rounded-md px-4 py-3 text-center text-lg font-medium dark:text-white dark:hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-dream-DEFAULT rounded-md px-4 py-3 text-center text-lg font-medium text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:signUp')}
                  </Link>
                </>
              )}

              <Link
                to="/subscription"
                className="text-moon-DEFAULT rounded-md px-4 py-3 text-center text-lg font-medium hover:bg-secondary/50"
                onClick={() => setIsMenuOpen(false)}
              >
                ✨ {t('misc:layout.subscribe')}
              </Link>
            </nav>
          </div>
        )}
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

      {/* Test iOS PWA Popup */}
      {showIOSPWATest && (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:rtl:left-4 md:rtl:right-auto">
          <div className="border-primary/20 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gradient-to-br from-primary/20 to-purple-100/50 p-2 dark:from-primary/30 dark:to-purple-900/30">
                <Menu className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                  {t('common:pwa.installApp')}
                </h3>

                <div className="mt-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('common:pwa.ios.installInstructions')}
                    </h4>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-300">1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('common:pwa.ios.step1')}
                      </span>
                      <div className="h-5 w-5 text-blue-600 dark:text-blue-400">📤</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                      <span className="text-sm font-bold text-green-600 dark:text-green-300">2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('common:pwa.ios.step2')}
                      </span>
                      <div className="flex items-center gap-1 rounded border bg-white px-2 py-1 dark:bg-gray-800">
                        <span className="text-gray-600 dark:text-gray-400">➕🏠</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-300">3</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('common:pwa.ios.step3')}
                    </span>
                  </div>

                  <Button onClick={() => setShowIOSPWATest(false)} className="w-full">
                    {t('common:pwa.gotIt')}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => setShowIOSPWATest(false)}
                variant="ghost"
                size="sm"
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
