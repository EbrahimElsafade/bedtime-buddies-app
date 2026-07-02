import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { isMembershipActive } from '@/utils/membership'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requirePremium?: boolean
  /** Max time (ms) to wait for auth/profile before failing safely. */
  timeoutMs?: number
}

/**
 * Route guard for authenticated (and optionally premium) pages.
 * - Redirects unauthenticated users to /login
 * - Redirects non-premium users to /subscription when requirePremium is true
 * - Falls back to a safe redirect if loading hangs longer than `timeoutMs`
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  requirePremium = false,
  timeoutMs = 8000,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isProfileLoaded, profile } = useAuth()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading && (!requirePremium || isProfileLoaded)) {
      setTimedOut(false)
      return
    }
    const id = setTimeout(() => setTimedOut(true), timeoutMs)
    return () => clearTimeout(id)
  }, [isLoading, isProfileLoaded, requirePremium, timeoutMs])

  // Timeout fallback — never let users wait forever
  if (timedOut) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
    if (requirePremium && !profile?.is_premium) {
      return <Navigate to="/subscription" replace />
    }
    return <>{children}</>
  }

  // Loading state with user-friendly message
  if (isLoading || (requirePremium && isAuthenticated && !isProfileLoaded)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requirePremium && !profile?.is_premium) {
    return <Navigate to="/subscription" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
