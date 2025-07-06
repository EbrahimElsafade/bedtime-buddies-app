import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";
import { Badge } from "@/components/ui/badge";

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

type StoryCategory = {
  id: string;
  name: string;
};

const Stories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  useEffect(() => {
    document.title = "Bedtime Stories - Browse Stories";
  }, []);

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
      
      return data as StoryCategory[];
    }
  });

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
              <Card key={i} className="story-card h-[400px] overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm animate-pulse pb-4">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
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
            <TabsList className="mb-4 w-fit h-auto flex justify-start">
              <TabsTrigger className="min-w-24" value="all">
                All Stories
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger className="min-w-24" key={category.id} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </TabsTrigger>
              ))}
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
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card className="story-card h-[400px] overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col pb-4">
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
                    {story.is_free ? (
                      <div className="absolute top-2 end-2 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                        FREE
                      </div>
                    ) : (
                      <div className="absolute top-2 end-2 bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <CardHeader className="pb-2 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{story.title}</CardTitle>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="secondary" className="text-xs">
                            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                          </Badge>
                          <div className="text-xs px-2 py-1 bg-secondary rounded-full">
                            {story.duration} mins
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">{story.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 mt-auto">
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
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stories;
