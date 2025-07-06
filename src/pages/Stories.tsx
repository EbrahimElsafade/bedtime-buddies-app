
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";

type StoryListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  is_free: boolean;
  duration: number;
  cover_image: string | null;
  languages: string[];
  is_published: boolean;
};

const Stories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  useEffect(() => {
    document.title = "Bedtime Stories - Browse Stories";
  }, []);

  const { data: allStories = [], isLoading } = useQuery({
    queryKey: ["published-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching stories:", error);
        throw error;
      }
      
      console.log("Fetched stories:", data);
      return data || [];
    }
  });

  const filteredStories = allStories.filter((story: StoryListItem) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bubbly mb-6">Discover Stories</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm animate-pulse">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">Discover Stories</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="mb-4 w-full max-w-2xl flex h-auto">
              <TabsTrigger value="all">
                All Stories
              </TabsTrigger>
              <TabsTrigger value="sleeping">
                Sleeping
              </TabsTrigger>
              <TabsTrigger value="religious">
                Religious
              </TabsTrigger>
              <TabsTrigger value="developmental">
                Developmental
              </TabsTrigger>
              <TabsTrigger value="entertainment">
                Entertainment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedCategory}>
              {filteredStories.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No stories found matching your search.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story: StoryListItem) => {
            const imageUrl = getImageUrl(story.cover_image);
            console.log(`Story ${story.title} - cover_image:`, story.cover_image, 'final URL:', imageUrl);
            
            return (
              <Card key={story.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
                <div className="aspect-[3/2] relative">
                  {imageUrl ? (
                    <img 
                      src={imageUrl}
                      alt={story.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load for story:', story.title, 'URL:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully for story:', story.title);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-white/80 dark:bg-nightsky-light/80">
                    {story.duration} mins
                  </div>
                  {story.is_free ? (
                    <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      FREE
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      PREMIUM
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                      {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{story.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1">
                    {story.languages.map(lang => (
                      <span 
                        key={lang} 
                        className="text-xs px-2 py-1 bg-secondary/50 rounded-full"
                      >
                        {lang === 'en' ? 'English' : lang === 'ar-eg' ? 'Arabic (Egyptian)' : 'Arabic (Fos7a)'}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/stories/${story.id}`} className="w-full">
                    <Button 
                      className={cn(
                        "w-full", 
                        story.is_free ? "bg-dream-DEFAULT hover:bg-dream-dark" : "bg-moon-DEFAULT hover:bg-moon-dark"
                      )}
                    >
                      {story.is_free ? "Read Now" : "Premium Story"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stories;
