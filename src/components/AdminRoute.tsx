
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated or to home if not an admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Render the child routes if user is an admin
  return <Outlet />;
};

export default AdminRoute;
