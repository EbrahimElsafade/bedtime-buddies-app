
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

const Appearance = () => {
  // State for home page sections
  const [homePageSections, setHomePageSections] = useState({
    freeStory: "",
    storiesSection: true,
    topRated: true,
    courses: true,
    specialStory: true,
  });

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

  const handleFreeStoryChange = (storyId: string) => {
    setHomePageSections(prev => ({
      ...prev,
      freeStory: storyId
    }));
  };

  const handleHomePageSectionChange = (section: keyof typeof homePageSections, checked: boolean) => {
    if (section === 'freeStory') return; // Handle free story separately
    
    setHomePageSections(prev => ({
      ...prev,
      [section]: checked
    }));
  };

  const handleSaveHomePageSettings = () => {
    // In a real app, this would save to the database
    toast.success("Home page settings saved successfully!");
  };

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
              <Button onClick={handleSaveHomePageSettings}>
                Save Home Page Settings
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
