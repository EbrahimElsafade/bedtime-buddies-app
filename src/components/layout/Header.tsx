
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { NavigationMenu } from './NavigationMenu'
import { UserActions } from './UserActions'

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  navigationSettings: any
}

export const Header = ({
  isDarkMode,
  toggleDarkMode,
  isMenuOpen,
  setIsMenuOpen,
  navigationSettings,
}: HeaderProps) => {
  const { t } = useTranslation(['navigation', 'auth', 'misc'])

  return (
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
        <NavigationMenu navigationSettings={navigationSettings} />

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

          <UserActions />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
    </header>
  )
}
