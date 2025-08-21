
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Profile } from "@/types/auth";
import { User } from "@supabase/supabase-js";

interface ProfileFormProps {
  user: User;
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
  onLogout: () => void;
}

export const ProfileForm = ({ user, profile, onUpdate, onLogout }: ProfileFormProps) => {
  const [name, setName] = useState(profile.parent_name || "");
  const [childName, setChildName] = useState(profile.child_name || "");
  const [language, setLanguage] = useState<"en" | "ar-eg" | "ar-fos7a" | "fr">(profile.preferred_language || "ar-fos7a");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        parent_name: name,
        child_name: childName || undefined,
        preferred_language: language
      });
      
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email || ""}
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
                onValueChange={(value) => setLanguage(value as "en" | "ar-eg" | "ar-fos7a" | "fr")}
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
                value={
                  language === "en" ? "English" : 
                  language === "ar-eg" ? "مصري" : 
                  language === "fr" ? "français" :
                  "فصحى"
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
            <Button variant="outline" onClick={onLogout}>
              Log Out
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
