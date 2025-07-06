
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Home, Book, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const Layout = () => {
  const { isAuthenticated, user, profile, logout } = useAuth();
  const { t } = useTranslation(['navigation', 'auth', 'misc']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Check for system preferred color scheme on initial load
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: t('navigation:home'), path: '/', icon: Home },
    { name: t('navigation:stories'), path: '/stories', icon: Book },
    { name: t('navigation:games'), path: '/games', icon: BookOpen },
    { name: t('navigation:profile'), path: isAuthenticated ? '/profile' : '/login', icon: User }
  ];

  // Handle scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col nightsky-gradient stars-bg dark:text-white pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-900/20 backdrop-blur-lg bg-white/70 dark:bg-nightsky/70">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-dream-DEFAULT flex items-center justify-center mr-2">
              <Moon className="h-6 w-6 text-black dark:text-white animate-float" />
            </div>
            <h1 className="text-xl font-bubbly text-dream-DEFAULT">{t('misc:layout.appName')}</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-dream-DEFAULT/30 text-dream-DEFAULT dark:text-white shadow-md"
                    : "text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10"
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
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-dream-DEFAULT  dark:text-white">
                    {profile?.parent_name || t('auth:profile')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-dream-DEFAULT  dark:text-white">
                  {t('auth:logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-dream-DEFAULT  dark:text-white">
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden rounded-full"
              aria-label={t('misc:accessibility.menu')}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-50 bg-white/90 dark:bg-nightsky/95 backdrop-blur-lg overflow-y-auto">
            <nav className="flex flex-col p-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-3 rounded-md text-center text-lg font-medium",
                    isActive(item.path)
                      ? "bg-dream-DEFAULT text-white shadow-md"
                      : "text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10"
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
                    className="px-4 py-3 rounded-md text-lg font-medium text-center text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:profile')}
                  </Link>
                  <button
                    className="px-4 py-3 rounded-md text-lg font-medium text-center text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10 w-full"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('auth:logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-md text-lg font-medium text-center text-dream-DEFAULT hover:bg-dream-DEFAULT/10 dark:text-white dark:hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 rounded-md text-center text-lg font-medium bg-dream-DEFAULT text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:signUp')}
                  </Link>
                </>
              )}
              
              <Link
                to="/subscription"
                className="px-4 py-3 rounded-md text-center text-lg font-medium text-moon-DEFAULT font-bold hover:bg-secondary/50"
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
      <footer className="py-6 border-t border-purple-900/20 bg-white/10 dark:bg-nightsky/50 hidden md:block">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm text-dream-DEFAULT hover:text-dream-dark dark:text-muted-foreground dark:hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/subscription"
              className="text-sm text-moon-DEFAULT hover:text-moon-dark"
            >
              {t('misc:layout.subscribe')}
            </Link>
          </div>
          <p className="text-xs text-dream-DEFAULT dark:text-muted-foreground">
            © {new Date().getFullYear()} {t('misc:layout.appName')}. {t('misc:layout.copyright')}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-nightsky-light border-t border-purple-900/20 h-16 z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-1/4 py-1 px-2 rounded-lg",
                isActive(item.path)
                  ? "text-dream-DEFAULT bg-dream-default/10"
                  : "text-dream-DEFAULT/70 dark:text-white/70"
              )}
            >
              <ItemIcon className={cn(
                "h-5 w-5", 
                isActive(item.path) ? "text-dream-DEFAULT" : "text-dream-DEFAULT/70 dark:text-white/70"
              )} />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
