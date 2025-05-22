
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  // Example settings state
  const [settings, setSettings] = useState({
    enableStoriesFeature: true,
    enableCoursesFeature: true,
    enableGamesFeature: false,
    autoPublishContent: false,
    defaultLanguage: "ar-eg",
    siteTitle: "Bedtime Stories",
    emailNotifications: true,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    toast.success("Settings saved successfully!");
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </header>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic functionality for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={settings.siteTitle}
                  onChange={(e) => updateSetting("siteTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ar-eg">Arabic (Egyptian)</option>
                  <option value="ar-fos7a">Arabic (Fos7a)</option>
                </select>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="enableStoriesFeature" className="text-base">
                    Enable Stories Feature
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to access the stories section
                  </p>
                </div>
                <Switch
                  id="enableStoriesFeature"
                  checked={settings.enableStoriesFeature}
                  onCheckedChange={(checked) =>
                    updateSetting("enableStoriesFeature", checked)
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="enableCoursesFeature" className="text-base">
                    Enable Courses Feature
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to access the educational courses section
                  </p>
                </div>
                <Switch
                  id="enableCoursesFeature"
                  checked={settings.enableCoursesFeature}
                  onCheckedChange={(checked) =>
                    updateSetting("enableCoursesFeature", checked)
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="enableGamesFeature" className="text-base">
                    Enable Games Feature
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to access the games section (coming soon)
                  </p>
                </div>
                <Switch
                  id="enableGamesFeature"
                  checked={settings.enableGamesFeature}
                  onCheckedChange={(checked) =>
                    updateSetting("enableGamesFeature", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Appearance settings coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="emailNotifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("emailNotifications", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="autoPublishContent" className="text-base">
                    Auto-publish Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish content after creation (not recommended)
                  </p>
                </div>
                <Switch
                  id="autoPublishContent"
                  checked={settings.autoPublishContent}
                  onCheckedChange={(checked) =>
                    updateSetting("autoPublishContent", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
