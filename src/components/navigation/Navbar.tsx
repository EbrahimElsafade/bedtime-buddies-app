import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DolphoonMascot } from '../DolphoonMascot'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface NavbarProps {
  navItems: Array<{
    name: string
    path: string
    icon: React.ElementType
    key: string
  }>
  isActive: (path: string) => boolean
}

export const Navbar = ({ navItems, isActive }: NavbarProps) => {
  const { t } = useTranslation(['auth', 'misc'])
  const { isAuthenticated, profile } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-secondary/70 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <DolphoonMascot size="sm" expression="happy" animate={false} />
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
                <Button variant="ghost" size="sm" className="rounded-sm">
                  {profile?.parent_name || t('auth:profile')}
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                {t('auth:login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}