import { Outlet, useLocation } from 'react-router-dom'
import { Home, BookOpen, User, Gamepad2, LibraryBig } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Navbar } from './navigation/Navbar'
import { Footer } from './navigation/Footer'
import { MobileNavigation } from './navigation/MobileNavigation'

const Layout = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(['navigation', 'auth', 'misc'])
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { name: t('navigation:home'), path: '/', icon: Home, key: 'home' },
    { name: t('navigation:stories'), path: '/stories', icon: BookOpen, key: 'stories' },
    { name: t('navigation:courses'), path: '/courses', icon: LibraryBig, key: 'courses' },
    { name: t('navigation:games'), path: '/games', icon: Gamepad2, key: 'games' },
    {
      name: t('navigation:profile'),
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
      key: 'profile',
    },
  ]

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
