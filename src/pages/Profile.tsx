
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { FavoritesTab } from "@/components/profile/FavoritesTab";
import { SubscriptionTab } from "@/components/profile/SubscriptionTab";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "Bedtime Stories - My Profile";
  }, []);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleUpdateProfile = async (updates: any) => {
    try {
      await updateProfile(updates);
      toast.success("Profile updated successfully");
    } catch (error) {
      // Error handled by updateProfile
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="mb-4">You need to be logged in to view this page.</p>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  if (!profile || !user) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="mb-4">Your profile could not be loaded. Please log in again.</p>
          <Button onClick={() => {
            logout();
            navigate("/login");
          }}>
            Log out and try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">My Profile</h1>
        
        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileForm
              user={user}
              profile={profile}
              onUpdate={handleUpdateProfile}
              onLogout={handleLogout}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <FavoritesTab />
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
