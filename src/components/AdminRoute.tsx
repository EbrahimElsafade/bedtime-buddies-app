
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, profile, user, isProfileLoaded } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add timeout to prevent infinite loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add debugging to help troubleshoot
  useEffect(() => {
    console.log("AdminRoute - Auth State:", { 
      isAuthenticated, 
      isLoading, 
      isProfileLoaded,
      hasProfile: !!profile,
      profileExists: profile ? "yes" : "no", 
      userId: user?.id,
      profileRole: profile?.role,
      pathname: location.pathname
    });
  }, [isAuthenticated, isLoading, profile, user, location, isProfileLoaded]);
  
  // If we've been loading for more than 5 seconds, show a message
  if ((isLoading || !isProfileLoaded) && !loadingTimeout) {
    console.log("AdminRoute - Still loading auth state");
    return (
      <div className="container mx-auto p-8">
        <h2 className="text-2xl mb-4">Loading Admin Dashboard...</h2>
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // If loading timeout occurred but we're still loading, give user an option
  if ((isLoading || !isProfileLoaded) && loadingTimeout) {
    return (
      <div className="container mx-auto p-8">
        <h2 className="text-2xl mb-4">Taking longer than expected...</h2>
        <p className="mb-4">We're having trouble loading the admin dashboard.</p>
        <div className="flex gap-4">
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <button 
            className="px-4 py-2 border border-input rounded-md"
            onClick={() => window.location.href = "/"}
          >
            Return Home
          </button>
        </div>
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
    console.log("AdminRoute - Not admin, redirecting to home", profile.role);
    return <Navigate to="/" replace />;
  }
  
  // Render the child routes if user is an admin
  console.log("AdminRoute - Admin access granted");
  return <Outlet />;
};

export default AdminRoute;
