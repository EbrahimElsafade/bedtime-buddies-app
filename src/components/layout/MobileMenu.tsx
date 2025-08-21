
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Home, Book, BookOpen, User, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationSettings {
  home: boolean
  stories: boolean
  courses: boolean
  games: boolean
  profile: boolean
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationSettings: NavigationSettings | undefined
}

export const MobileMenu = ({ isOpen, onClose, navigationSettings }: MobileMenuProps) => {
  const { isAuthenticated, logout } = useAuth()
  const { t } = useTranslation(['navigation', 'auth', 'misc'])
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

  if (!isOpen) return null

  return (
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
            onClick={onClose}
          >
            {item.name}
          </Link>
        ))}

        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="text-dream-DEFAULT hover:bg-dream-DEFAULT/10 rounded-md px-4 py-3 text-center text-lg font-medium dark:text-white dark:hover:bg-white/10"
              onClick={onClose}
            >
              {t('auth:profile')}
            </Link>
            <button
              className="text-dream-DEFAULT hover:bg-dream-DEFAULT/10 w-full rounded-md px-4 py-3 text-center text-lg font-medium dark:text-white dark:hover:bg-white/10"
              onClick={() => {
                logout()
                onClose()
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
              onClick={onClose}
            >
              {t('auth:login')}
            </Link>
            <Link
              to="/register"
              className="bg-dream-DEFAULT rounded-md px-4 py-3 text-center text-lg font-medium text-white"
              onClick={onClose}
            >
              {t('auth:signUp')}
            </Link>
          </>
        )}

        <Link
          to="/subscription"
          className="text-moon-DEFAULT rounded-md px-4 py-3 text-center text-lg font-medium hover:bg-secondary/50"
          onClick={onClose}
        >
          ✨ {t('misc:layout.subscribe')}
        </Link>
      </nav>
    </div>
  )
}
