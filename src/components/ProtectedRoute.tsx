import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
}

/**
 * Route guard for authenticated-only pages (Profile, Favorites, etc.)
 * Redirects unauthenticated users to login with return URL
 */
const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show nothing while checking auth status
  if (isLoading) {
    return null
  }

  // Redirect unauthenticated users to login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location.pathname }} 
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
