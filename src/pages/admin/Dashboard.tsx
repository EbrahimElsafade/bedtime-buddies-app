
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User, CircleUser, BookOpen, Presentation, CalendarClock } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalStories: 0,
    publishedStories: 0,
    totalCourses: 0,
    publishedCourses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user stats
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('is_premium');
          
        if (profilesError) throw profilesError;
        
        // Fetch stories stats
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('is_published');
          
        if (storiesError) throw storiesError;
        
        // Fetch courses stats
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('is_published');
          
        if (coursesError) throw coursesError;
        
        setStats({
          totalUsers: profiles?.length || 0,
          premiumUsers: profiles?.filter(p => p.is_premium).length || 0,
          totalStories: stories?.length || 0,
          publishedStories: stories?.filter(s => s.is_published).length || 0,
          totalCourses: courses?.length || 0,
          publishedCourses: courses?.filter(c => c.is_published).length || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application content and users</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : `${stats.premiumUsers} premium users`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalStories}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : `${stats.publishedStories} published`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : `${stats.publishedCourses} published`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions performed in the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CalendarClock className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Activity log will be shown here</p>
                    <p className="text-sm text-muted-foreground">
                      Recent actions will be tracked and displayed in this section
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Current system status and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium mb-2">User Distribution</h3>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading..." : `${stats.premiumUsers} Premium / ${stats.totalUsers - stats.premiumUsers} Free`}
                    </p>
                  </div>
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium mb-2">Content Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading..." : `${stats.publishedStories + stats.publishedCourses} Published / ${(stats.totalStories + stats.totalCourses) - (stats.publishedStories + stats.publishedCourses)} Draft`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
