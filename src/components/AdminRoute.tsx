
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading, user, isProfileLoaded } = useAuth()
  const { isAdmin, isLoading: roleLoading } = useUserRole(user)
  const location = useLocation()
  const mountTimeRef = useRef(Date.now())

  // useEffect(() => {
  //   logger.debug('AdminRoute component mounted/updated', {
  //     isAuthenticated,
  //     isLoading,
  //     hasProfile: !!profile,
  //     profileRole: profile?.role,
  //     hasUser: !!user,
  //     isProfileLoaded,
  //     location: location.pathname
  //   })
  // }, [isAuthenticated, isLoading, profile, user, location, isProfileLoaded])

  // Early redirect for unauthenticated users - don't show loading
  if (!isLoading && !isAuthenticated) {
    // logger.info('AdminRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Early redirect for authenticated users who are not admins
  if (!isLoading && !roleLoading && isAuthenticated && isProfileLoaded) {
    if (!isAdmin) {
      return <Navigate to="/404" replace />
    }
  }

  // Show loading state only while we're still determining auth/profile/role status
  if (isLoading || roleLoading || (isAuthenticated && !isProfileLoaded)) {
    const timeSinceMount = Date.now() - mountTimeRef.current

    // If it's been loading for more than 5 seconds, something might be wrong
    // if (timeSinceMount > 5000) {
    //   logger.warn('AdminRoute has been loading for more than 5 seconds')
    // }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-gray-600">{t('admin:common.verifying_access')}</p>
        </div>
      </div>
    )
  }

  // Render the children if user is an admin
  // logger.info('AdminRoute - Admin access granted')
  return <>{children}</>
}

export default AdminRoute
