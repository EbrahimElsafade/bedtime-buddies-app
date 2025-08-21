
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Home, Book, BookOpen, User, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationSettings {
  home: boolean
  stories: boolean
  courses: boolean
  games: boolean
  profile: boolean
}

interface NavigationMenuProps {
  navigationSettings: NavigationSettings | undefined
}

export const NavigationMenu = ({ navigationSettings }: NavigationMenuProps) => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['navigation'])
  const location = useLocation()

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
  )
}
