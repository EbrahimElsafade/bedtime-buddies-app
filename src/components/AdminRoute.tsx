
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoleManagement } from '@/hooks/useRoleManagement'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { isAdmin, isLoading: roleLoading } = useRoleManagement(user)
  const location = useLocation()
  const mountTimeRef = useRef(Date.now())

  const isLoading = authLoading || roleLoading

  // Early redirect for unauthenticated users - don't show loading
  if (!authLoading && !isAuthenticated) {
    console.log('AdminRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Early redirect for non-admin users once we've checked their role
  if (!isLoading && !isAdmin) {
    console.log('AdminRoute: Not admin, redirecting to 404', {
      isLoading,
      isAdmin,
      userId: user?.id
    })
    return <Navigate to="/404" replace />
  }

  if (!isLoading && isAdmin) {
    console.log('AdminRoute: Admin access granted')
  }

  // Show loading state while determining auth/role status
  if (isLoading) {
    const timeSinceMount = Date.now() - mountTimeRef.current

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-gray-600">{t('admin:common.verifying_access')}</p>
        </div>
      </div>
    )
  }

  // Render the children if user is authenticated and an admin
  return <>{children}</>
}

export default AdminRoute
