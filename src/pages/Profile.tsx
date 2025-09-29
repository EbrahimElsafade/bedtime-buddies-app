
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
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation(['common', 'auth']);
  const { language } = useLanguage();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [profileLanguage, setProfileLanguage] = useState<"en" | "ar-eg" | "ar-fos7a" | "fr">("ar-fos7a");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync i18next with LanguageContext
  useEffect(() => {
    const langMap: Record<string, string> = {
      'en': 'en',
      'ar': 'ar',
      'fr': 'fr'
    };
    const i18nLang = langMap[language] || 'ar';
    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang);
    }
  }, [language, i18n]);
  
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
    document.title = `${t('common:appName')} - ${t('common:profile')}`;
  }, [t, language]);
  
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
      setProfileLanguage(profile.preferred_language || "ar-eg");
    }
  }, [user, profile]);
  
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        parent_name: name,
        child_name: childName || undefined,
        preferred_language: profileLanguage
      });
      
      setIsEditing(false);
      toast.success(t('common:profileUpdated'));
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

  const getLanguageDisplayName = (langCode: string) => {
    switch (langCode) {
      case "en": return "English";
      case "ar-eg": return "مصري";
      case "fr": return "français";
      default: return "فصحى";
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('common:loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="mb-4">{t('auth:loginRequired')}</p>
          <Button onClick={() => navigate("/login")}>
            {t('auth:goToLogin')}
          </Button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="mb-4">{t('common:profileLoadError')}</p>
          <Button onClick={() => {
            logout();
            navigate("/login");
          }}>
            {t('auth:logoutTryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gradient-to-b min-h-[82.7svh] from-primary/20 to-primary/10">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">{t('common:myProfile')}</h1>
        
        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t('common:profile')}</TabsTrigger>
            <TabsTrigger value="favorites">{t('common:favorites')}</TabsTrigger>
            <TabsTrigger value="subscription">{t('common:subscription')}</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:personalInformation')}</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? t('common:editProfileDescription')
                    : t('common:viewProfileDescription')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common:yourName')}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common:email')}</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('common:emailCannotChange')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="childName">{t('common:childName')}</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      disabled={!isEditing}
                      placeholder={isEditing ? t('common:enterChildName') : t('common:notProvided')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('common:preferredLanguage')}</Label>
                    {isEditing ? (
                      <Select 
                        value={profileLanguage} 
                        onValueChange={(value) => setProfileLanguage(value as "en" | "ar-eg" | "ar-fos7a" | "fr")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar-eg">مصري</SelectItem>
                          <SelectItem value="ar-fos7a">فصحى</SelectItem>
                          <SelectItem value="fr">français</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={getLanguageDisplayName(profileLanguage)} 
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
                      {t('common:cancel')}
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common:saving')}
                        </>
                      ) : (
                        t('common:saveChanges')
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleLogout}>
                      {t('auth:logout')}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      {t('common:editProfile')}
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
                <CardTitle>{t('common:myFavoriteStories')}</CardTitle>
                <CardDescription>
                  {t('common:favoriteStoriesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('common:noFavoritesYet')}
                </p>
                <Button onClick={() => navigate("/stories")}>
                  {t('common:browseStories')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:mySubscription')}</CardTitle>
                <CardDescription>
                  {t('common:manageSubscriptionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="inline-block bg-secondary/50 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-medium">
                      {profile.is_premium ? t('common:premiumPlan') : t('common:freePlan')}
                    </span>
                  </div>
                  
                  {profile.is_premium ? (
                    <p className="text-muted-foreground mb-6">
                      {t('common:premiumPlanDescription')}
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-6">
                      {t('common:freePlanDescription')}
                    </p>
                  )}
                  
                  {!profile.is_premium && (
                    <Button 
                      onClick={() => navigate("/subscription")} 
                      className="bg-moon-DEFAULT hover:bg-moon-dark"
                    >
                      {t('common:upgradeToPremium')}
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
