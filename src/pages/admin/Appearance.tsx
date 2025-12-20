
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { useLoading } from "@/contexts/LoadingContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { getMultilingualText } from "@/utils/multilingualUtils";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface HomePageSettings {
  freeStory: string;
  freeStoryEnabled: boolean;
  storiesSection: boolean;
  topRated: boolean;
  courses: boolean;
  specialStory: boolean;
}

interface StoryOption {
  id: string;
  title: Record<string, string>;
  cover_image: string | null;
}

const Appearance = () => {
  const queryClient = useQueryClient();
  const { setIsLoading, setLoadingMessage } = useLoading();
  
  // Fetch home page settings
  const { data: homeSettings, isLoading: homeLoading } = useQuery({
    queryKey: ["appearance-settings", "home_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appearance_settings")
        .select("setting_value")
        .eq("setting_key", "home_page")
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value as unknown as HomePageSettings;
    }
  });

  // Fetch stories for free story selection
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["stories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, cover_image")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as StoryOption[];
    }
  });

  // Local state for settings
  const [settings, setSettings] = useState<HomePageSettings>({
    freeStory: "",
    freeStoryEnabled: true,
    storiesSection: true,
    topRated: true,
    courses: true,
    specialStory: true,
  });

  useEffect(() => {
    if (homeSettings) {
      setSettings(homeSettings);
    }
  }, [homeSettings]);

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: HomePageSettings) => {
      const settingsJson: Json = {
        ...newSettings
      };

      const { error } = await supabase
        .from("appearance_settings")
        .upsert({
          setting_key: "home_page",
          setting_value: settingsJson
        }, {
          onConflict: "setting_key"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["appearance-settings"] });
    },
    onError: (error: Error) => {
      logger.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = <K extends keyof HomePageSettings>(key: K, value: HomePageSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    setIsLoading(homeLoading);
    if (homeLoading) {
      setLoadingMessage('Loading appearance settings...');
    }
  }, [homeLoading, setIsLoading, setLoadingMessage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Appearance Settings</h1>
        <p className="text-muted-foreground">
          Configure how your homepage appears to visitors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections</CardTitle>
          <CardDescription>
            Control which sections are displayed on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="free-story-enabled">Free Story Section</Label>
              <p className="text-sm text-muted-foreground">
                Show a featured free story on the homepage
              </p>
            </div>
            <Switch
              id="free-story-enabled"
              checked={settings.freeStoryEnabled}
              onCheckedChange={(checked) => updateSetting('freeStoryEnabled', checked)}
            />
          </div>

          {settings.freeStoryEnabled && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="free-story">Select Free Story</Label>
              <Select
                value={settings.freeStory}
                onValueChange={(value) => updateSetting('freeStory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a free story to feature" />
                </SelectTrigger>
                <SelectContent>
                  {storiesLoading ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      Loading stories...
                    </div>
                  ) : stories && stories.length > 0 ? (
                    stories.map((story) => {
                      const storyTitle = getMultilingualText(story.title, 'en', 'en');
                      return (
                        <SelectItem key={story.id} value={story.id}>
                          {storyTitle}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No published stories available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stories-section">Stories Section</Label>
              <p className="text-sm text-muted-foreground">
                Display the main stories browsing section
              </p>
            </div>
            <Switch
              id="stories-section"
              checked={settings.storiesSection}
              onCheckedChange={(checked) => updateSetting('storiesSection', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="top-rated">Top Rated Section</Label>
              <p className="text-sm text-muted-foreground">
                Show popular and highly-rated stories
              </p>
            </div>
            <Switch
              id="top-rated"
              checked={settings.topRated}
              onCheckedChange={(checked) => updateSetting('topRated', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="courses">Courses Section</Label>
              <p className="text-sm text-muted-foreground">
                Display available courses and learning materials
              </p>
            </div>
            <Switch
              id="courses"
              checked={settings.courses}
              onCheckedChange={(checked) => updateSetting('courses', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="special-story">Special Story Section</Label>
              <p className="text-sm text-muted-foreground">
                Feature a special highlighted story
              </p>
            </div>
            <Switch
              id="special-story"
              checked={settings.specialStory}
              onCheckedChange={(checked) => updateSetting('specialStory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Appearance;
