
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef } from 'react'

const AdminRoute = () => {
  const { isAuthenticated, isLoading, profile, user, isProfileLoaded } =
    useAuth()
  const location = useLocation()
  const lastStateRef = useRef<string>('')
  const mountTimeRef = useRef(Date.now())

  // Add comprehensive debugging but reduce noise
  useEffect(() => {
    const currentState = JSON.stringify({
      isAuthenticated,
      isLoading,
      isProfileLoaded,
      hasProfile: !!profile,
      userId: user?.id,
      profileRole: profile?.role,
      pathname: location.pathname,
    })

    // Helper function to determine why a user might be redirected
    const getRedirectReason = () => {
      if (isLoading) return 'Still loading'
      if (!isProfileLoaded) return 'Profile not loaded yet'
      if (!isAuthenticated || !user) return 'Not authenticated'
      if (!profile) return 'No profile found'
      if (profile.role !== 'admin') return `Not admin role (${profile.role})`
      return 'Should be granted access'
    }

    // Only log if state actually changed and it's been a bit since mounting
    const timeSinceMount = Date.now() - mountTimeRef.current
    if (currentState !== lastStateRef.current && timeSinceMount > 100) {
      console.log('AdminRoute - State change:', {
        isAuthenticated,
        isLoading,
        isProfileLoaded,
        hasProfile: !!profile,
        profileExists: profile ? 'yes' : 'no',
        userId: user?.id,
        profileRole: profile?.role,
        pathname: location.pathname,
        redirectReason: getRedirectReason(),
      })
      lastStateRef.current = currentState
    }
  }, [isAuthenticated, isLoading, profile, user, location, isProfileLoaded])

  // Early redirect for unauthenticated users - don't show loading
  if (!isLoading && !isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Early redirect for authenticated users without profiles or non-admin users
  if (!isLoading && isAuthenticated && isProfileLoaded) {
    if (!profile) {
      console.log('AdminRoute - No profile found, redirecting to 404')
      return <Navigate to="/404" replace />
    }

    if (profile.role !== 'admin') {
      console.log('AdminRoute - Not admin, redirecting to 404. Role:', profile.role)
      return <Navigate to="/404" replace />
    }
  }

  // Show loading state only while we're still determining auth/profile status
  if (isLoading || (isAuthenticated && !isProfileLoaded)) {
    const timeSinceMount = Date.now() - mountTimeRef.current

    // If it's been loading for more than 5 seconds, something might be wrong
    if (timeSinceMount > 5000) {
      console.warn('AdminRoute - Loading for too long, might be stuck')
    }

    return (
      <div className="container mx-auto p-8">
        <h2 className="mb-4 text-2xl">Loading Admin Dashboard...</h2>
        <Skeleton className="mb-6 h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Render the child routes if user is an admin
  console.log('AdminRoute - Admin access granted')
  return <Outlet />
}

export default AdminRoute
