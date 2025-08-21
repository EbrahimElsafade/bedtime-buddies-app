
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export const UserActions = () => {
  const { isAuthenticated, profile, logout } = useAuth()
  const { t } = useTranslation(['auth'])

  if (isAuthenticated) {
    return (
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
    )
  }

  return (
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
  )
}
