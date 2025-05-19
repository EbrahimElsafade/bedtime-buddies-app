
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stories, Story } from "@/data/stories";
import { cn } from "@/lib/utils";

const Stories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStories, setFilteredStories] = useState<Story[]>(stories);
  
  useEffect(() => {
    document.title = "Bedtime Stories - Browse Stories";
    
    const filtered = stories.filter(story => 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredStories(filtered);
  }, [searchQuery]);

  const filterByCategory = (category: Story['category'] | 'all') => {
    if (category === 'all') {
      return stories.filter(story => 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return stories.filter(story => 
      story.category === category &&
      (story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

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
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 w-full max-w-2xl grid grid-cols-5 h-auto">
              <TabsTrigger value="all" onClick={() => setFilteredStories(filterByCategory('all'))}>
                All Stories
              </TabsTrigger>
              <TabsTrigger value="sleeping" onClick={() => setFilteredStories(filterByCategory('sleeping'))}>
                Sleeping
              </TabsTrigger>
              <TabsTrigger value="religious" onClick={() => setFilteredStories(filterByCategory('religious'))}>
                Religious
              </TabsTrigger>
              <TabsTrigger value="developmental" onClick={() => setFilteredStories(filterByCategory('developmental'))}>
                Developmental
              </TabsTrigger>
              <TabsTrigger value="entertainment" onClick={() => setFilteredStories(filterByCategory('entertainment'))}>
                Entertainment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No stories found matching your search.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="aspect-[3/2] relative">
                <img 
                  src={story.coverImage} 
                  alt={story.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-white/80 dark:bg-nightsky-light/80">
                  {story.duration} mins
                </div>
                {story.isFree ? (
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
                      story.isFree ? "bg-dream-DEFAULT hover:bg-dream-dark" : "bg-moon-DEFAULT hover:bg-moon-dark"
                    )}
                  >
                    {story.isFree ? "Read Now" : "Premium Story"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stories;
