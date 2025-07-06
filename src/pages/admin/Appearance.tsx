import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HomePageSettings {
  freeStory: string;
  storiesSection: boolean;
  topRated: boolean;
  courses: boolean;
  specialStory: boolean;
}

const Appearance = () => {
  const queryClient = useQueryClient();
  
  // State for home page sections
  const [homePageSections, setHomePageSections] = useState<HomePageSettings>({
    freeStory: "",
    storiesSection: true,
    topRated: true,
    courses: true,
    specialStory: true,
  });

  // Fetch current appearance settings
  const { data: appearanceSettings, isLoading: settingsLoading } = useQuery({
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

  // Load settings when data is fetched
  useEffect(() => {
    if (appearanceSettings) {
      setHomePageSections(appearanceSettings);
    }
  }, [appearanceSettings]);

  // Fetch published stories for the free story select
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["published-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title")
        .eq("is_published", true)
        .order("title");
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation to save settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: HomePageSettings) => {
      const { error } = await supabase
        .from("appearance_settings")
        .upsert({ 
          setting_key: "home_page",
          setting_value: settings as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "setting_key"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Home page settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["appearance-settings"] });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  });

  const handleFreeStoryChange = (storyId: string) => {
    const updatedSections = {
      ...homePageSections,
      freeStory: storyId
    };
    setHomePageSections(updatedSections);
    // Auto-save when free story is selected
    saveSettingsMutation.mutate(updatedSections);
  };

  const handleHomePageSectionChange = (section: keyof HomePageSettings, checked: boolean) => {
    if (section === 'freeStory') return; // Handle free story separately
    
    setHomePageSections(prev => ({
      ...prev,
      [section]: checked
    }));
  };

  const handleSaveHomePageSettings = () => {
    saveSettingsMutation.mutate(homePageSections);
  };

  if (settingsLoading) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Appearance</h1>
          <p className="text-muted-foreground">
            Customize the appearance and layout of your application pages
          </p>
        </header>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-6 w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the appearance and layout of your application pages
        </p>
      </header>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="story">Story Page</TabsTrigger>
          <TabsTrigger value="course">Course Page</TabsTrigger>
          <TabsTrigger value="games">Games Page</TabsTrigger>
          <TabsTrigger value="profile">Profile Page</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Appearance</CardTitle>
              <CardDescription>
                Configure general appearance settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle>Home Page Layout</CardTitle>
              <CardDescription>
                Configure which sections appear on the home page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="freeStory">Free Story Section</Label>
                <Select
                  value={homePageSections.freeStory}
                  onValueChange={handleFreeStoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a story to feature as free" />
                  </SelectTrigger>
                  <SelectContent>
                    {storiesLoading ? (
                      <SelectItem value="" disabled>Loading stories...</SelectItem>
                    ) : stories?.length === 0 ? (
                      <SelectItem value="" disabled>No published stories available</SelectItem>
                    ) : (
                      stories?.map(story => (
                        <SelectItem key={story.id} value={story.id}>
                          {story.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="storiesSection"
                  checked={homePageSections.storiesSection}
                  onCheckedChange={(checked) => 
                    handleHomePageSectionChange('storiesSection', checked as boolean)
                  }
                />
                <Label htmlFor="storiesSection" className="text-base font-medium">
                  Stories Section
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="topRated"
                  checked={homePageSections.topRated}
                  onCheckedChange={(checked) => 
                    handleHomePageSectionChange('topRated', checked as boolean)
                  }
                />
                <Label htmlFor="topRated" className="text-base font-medium">
                  Top Rated Stories
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="courses"
                  checked={homePageSections.courses}
                  onCheckedChange={(checked) => 
                    handleHomePageSectionChange('courses', checked as boolean)
                  }
                />
                <Label htmlFor="courses" className="text-base font-medium">
                  Courses Section
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specialStory"
                  checked={homePageSections.specialStory}
                  onCheckedChange={(checked) => 
                    handleHomePageSectionChange('specialStory', checked as boolean)
                  }
                />
                <Label htmlFor="specialStory" className="text-base font-medium">
                  Special Story Section
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveHomePageSettings}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? "Saving..." : "Save Home Page Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="story">
          <Card>
            <CardHeader>
              <CardTitle>Story Page Appearance</CardTitle>
              <CardDescription>
                Configure the appearance of story pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course">
          <Card>
            <CardHeader>
              <CardTitle>Course Page Appearance</CardTitle>
              <CardDescription>
                Configure the appearance of course pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Games Page Appearance</CardTitle>
              <CardDescription>
                Configure the appearance of games pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Page Appearance</CardTitle>
              <CardDescription>
                Configure the appearance of profile pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appearance;
