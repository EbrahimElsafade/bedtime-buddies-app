
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
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation('admin');
  
  // Example settings state
  const [settings, setSettings] = useState({
    enableStoriesFeature: true,
    enableCoursesFeature: true,
    enableGamesFeature: false,
    autoPublishContent: false,
    defaultLanguage: "ar-eg",
    siteTitle: "Dolphoon",
    emailNotifications: true,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    toast.success(t('forms.saved'));
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.description')}
        </p>
      </header>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('settings.tabs.advanced')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.general')}</CardTitle>
              <CardDescription>
                Configure basic functionality for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">{t('settings.siteTitle')}</Label>
                <Input
                  id="siteTitle"
                  value={settings.siteTitle}
                  onChange={(e) => updateSetting("siteTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">{t('settings.default_language')}</Label>
                <select
                  id="defaultLanguage"
                  className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                >
                  <option value="en">{t('languages.english')}</option>
                  <option value="ar-eg">العربية -مصر</option>
                  <option value="ar-su">العربية الفصحي</option>
                  <option value="ar-fos7a">العربية الفصحي</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="enableStoriesFeature" className="text-base">
                    {t('settings.features.stories.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.features.stories.description')}
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
                    {t('settings.features.courses.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.features.courses.description')}
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
                    {t('settings.features.games.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.features.games.description')}
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
              <Button onClick={handleSaveSettings}>{t('forms.saved')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance.title')}</CardTitle>
              <CardDescription>
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                {t('settings.appearance.coming_soon')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications.title')}</CardTitle>
              <CardDescription>
                {t('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="emailNotifications" className="text-base">
                    {t('settings.notifications.email.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notifications.email.description')}
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
              <Button onClick={handleSaveSettings}>{t('forms.saved')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.advanced.title')}</CardTitle>
              <CardDescription>
                {t('settings.advanced.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="autoPublishContent" className="text-base">
                    {t('settings.advanced.auto_publish.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.advanced.auto_publish.description')}
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
              <Button onClick={handleSaveSettings}>{t('forms.saved')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
