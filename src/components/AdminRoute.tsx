
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  
  // Add debugging to help troubleshoot
  useEffect(() => {
    console.log("AdminRoute - Auth State:", { 
      isAuthenticated, 
      isLoading, 
      profile, 
      userId: user?.id 
    });
  }, [isAuthenticated, isLoading, profile, user]);
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("AdminRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
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
