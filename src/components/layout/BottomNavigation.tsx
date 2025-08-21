
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

interface BottomNavigationProps {
  navigationSettings: NavigationSettings | undefined
}

export const BottomNavigation = ({ navigationSettings }: BottomNavigationProps) => {
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
    if (!navigationSettings) return true
    return navigationSettings[item.key as keyof NavigationSettings] !== false
  })

  return (
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
  )
}
