
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, profile, user, isProfileLoaded } = useAuth();
  const location = useLocation();
  const lastStateRef = useRef<string>('');
  const mountTimeRef = useRef(Date.now());
  
  // Add comprehensive debugging but reduce noise
  useEffect(() => {
    const currentState = JSON.stringify({ 
      isAuthenticated, 
      isLoading, 
      isProfileLoaded,
      hasProfile: !!profile,
      userId: user?.id,
      profileRole: profile?.role,
      pathname: location.pathname
    });
    
    // Only log if state actually changed and it's been a bit since mounting
    const timeSinceMount = Date.now() - mountTimeRef.current;
    if (currentState !== lastStateRef.current && timeSinceMount > 100) {
      console.log("AdminRoute - State change:", { 
        isAuthenticated, 
        isLoading, 
        isProfileLoaded,
        hasProfile: !!profile,
        profileExists: profile ? "yes" : "no", 
        userId: user?.id,
        profileRole: profile?.role,
        pathname: location.pathname,
        redirectReason: getRedirectReason()
      });
      lastStateRef.current = currentState;
    }
  }, [isAuthenticated, isLoading, profile, user, location, isProfileLoaded]);
  
  // Helper function to determine why a user might be redirected
  const getRedirectReason = () => {
    if (isLoading) return "Still loading";
    if (!isProfileLoaded) return "Profile not loaded yet";
    if (!isAuthenticated || !user) return "Not authenticated";
    if (!profile) return "No profile found";
    if (profile.role !== 'admin') return `Not admin role (${profile.role})`;
    return "Should be granted access";
  };
  
  // Show loading state while authentication is being checked
  // But only show it for a reasonable amount of time
  if (isLoading || !isProfileLoaded) {
    const timeSinceMount = Date.now() - mountTimeRef.current;
    
    // If it's been loading for more than 5 seconds, something might be wrong
    if (timeSinceMount > 5000) {
      console.warn("AdminRoute - Loading for too long, might be stuck");
    }
    
    return (
      <div className="container mx-auto p-8">
        <h2 className="text-2xl mb-4">Loading Admin Dashboard...</h2>
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log("AdminRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Check if profile exists
  if (!profile) {
    console.log("AdminRoute - No profile found, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // Redirect to home if not an admin
  if (profile.role !== 'admin') {
    console.log("AdminRoute - Not admin, redirecting to home. Role:", profile.role);
    return <Navigate to="/" replace />;
  }
  
  // Render the child routes if user is an admin
  console.log("AdminRoute - Admin access granted");
  return <Outlet />;
};

export default AdminRoute;
