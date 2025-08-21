
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Home, Book, BookOpen, User, Layers } from 'lucide-react'

interface NavigationSettings {
  home: boolean
  stories: boolean
  courses: boolean
  games: boolean
  profile: boolean
}

interface FooterProps {
  navigationSettings: NavigationSettings | undefined
}

export const Footer = ({ navigationSettings }: FooterProps) => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['navigation', 'misc'])

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
  ]

  // Filter nav items based on navigation settings
  const navItems = allNavItems.filter(item => {
    if (!navigationSettings) return true
    return navigationSettings[item.key as keyof NavigationSettings] !== false
  })

  return (
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
  )
}
