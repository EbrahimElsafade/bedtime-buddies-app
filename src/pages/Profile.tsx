import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const { t } = useTranslation('auth');
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [language, setLanguage] = useState<"en" | "ar-eg" | "ar-fos7a">("ar-eg");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log("Profile page - Auth state:", { 
      isAuthenticated, 
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile
    });
  }, [user, profile, isAuthenticated, isLoading]);
  
  // Set page title
  useEffect(() => {
    document.title = "Bedtime Stories - My Profile";
  }, []);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Profile - Not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Update form data when profile is loaded
  useEffect(() => {
    if (user && profile) {
      setName(profile.parent_name || "");
      setEmail(user.email || "");
      setChildName(profile.child_name || "");
      setLanguage(profile.preferred_language || "ar-eg");
    }
  }, [user, profile]);
  
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        parent_name: name,
        child_name: childName || undefined,
        preferred_language: language
      });
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      // Error handled by updateProfile
    } finally {
      setIsSaving(false);
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
  
  if (!profile) {
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
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">{t('profile')}</h1>
        
        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? "Edit your profile information" 
                    : "View and manage your account details"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child's Name</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      disabled={!isEditing}
                      placeholder={isEditing ? "Enter child's name" : "Not provided"}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    {isEditing ? (
                      <Select 
                        value={language} 
                        onValueChange={(value) => setLanguage(value as "en" | "ar-eg" | "ar-fos7a")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar-eg">Arabic (Egyptian)</SelectItem>
                          <SelectItem value="ar-fos7a">Arabic (Fos7a)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={
                          language === "en" ? "English" : 
                          language === "ar-eg" ? "Arabic (Egyptian)" : 
                          "Arabic (Fos7a)"
                        } 
                        disabled 
                      />
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleLogout}>
                      {t('logout')}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>My Favorite Stories</CardTitle>
                <CardDescription>
                  Stories you've marked as favorites
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't added any stories to favorites yet.
                </p>
                <Button onClick={() => navigate("/stories")}>
                  Browse Stories
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>My Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="inline-block bg-secondary/50 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-medium">
                      {profile.is_premium ? "Premium Plan" : "Free Plan"}
                    </span>
                  </div>
                  
                  {profile.is_premium ? (
                    <p className="text-muted-foreground mb-6">
                      You are currently on the Premium plan. Enjoy unlimited access to all stories and features.
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-6">
                      Upgrade to Premium for unlimited access to all stories and features.
                    </p>
                  )}
                  
                  {!profile.is_premium && (
                    <Button 
                      onClick={() => navigate("/subscription")} 
                      className="bg-moon-DEFAULT hover:bg-moon-dark"
                    >
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
