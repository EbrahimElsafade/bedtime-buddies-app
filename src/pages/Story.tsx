
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Share, ChevronLeft, ChevronRight, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";

const Story = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar-eg' | 'ar-fos7a'>('en');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const { data: story, isLoading, error } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      if (!storyId) throw new Error("Story ID is required");
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .eq("is_published", true)
        .single();
      
      if (error) {
        console.error("Error fetching story:", error);
        throw error;
      }
      console.log(data)
      return data;
    },
    enabled: !!storyId
  });

  useEffect(() => {
    if (story) {
      document.title = `${story.title} - Bedtime Stories`;
      
      // Set preferred language if available - with proper type checking
      const preferredLang = profile?.preferred_language;
      if (preferredLang && 
          (preferredLang === 'en' || preferredLang === 'ar-eg' || preferredLang === 'ar-fos7a') &&
          story.languages.includes(preferredLang)) {
        setCurrentLanguage(preferredLang);
      } else if (story.languages.length > 0) {
        // Ensure the first language is one of our supported types
        const firstLang = story.languages[0];
        if (firstLang === 'en' || firstLang === 'ar-eg' || firstLang === 'ar-fos7a') {
          setCurrentLanguage(firstLang);
        }
      }
    }
  }, [story, profile]);

  useEffect(() => {
    if (error || (!isLoading && !story)) {
      navigate("/stories", { replace: true });
    }
  }, [error, story, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="aspect-[3/2] bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  // For now, we'll create placeholder scenes since we don't have the scene data structure set up yet
  const scenes = [
    { 
      text: story.description || "Story content coming soon...", 
      image: getImageUrl(story.cover_image)
    }
  ];
  const currentScene = scenes[currentSceneIndex];
  
  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };
  
  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };
  
  const toggleFavorite = () => {
    if (isAuthenticated) {
      setIsFavorite(!isFavorite);
    } else {
      navigate("/login");
    }
  };
  
  const toggleAudio = () => {
    // In a real app, this would control audio playback
    setIsAudioPlaying(!isAudioPlaying);
  };

  const canAccessStory = story.is_free || (isAuthenticated && profile?.is_premium);
  const showPremiumMessage = !story.is_free && (!isAuthenticated || !profile?.is_premium);
  
  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Story Header */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/stories")} className="mb-4 px-2">
            <ChevronLeft className="rtl:rotate-180 me-1 h-4 w-4" /> Back to Stories
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFavorite} 
              className={cn("rounded-full", isFavorite && "text-red-500")}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              aria-label="Share story"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bubbly mb-2">{story.title}</h1>
          <p className="text-muted-foreground mb-4">{story.description}</p>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-secondary/50 rounded-full">
              {story.duration} mins
            </span>
            <span className="px-2 py-1 bg-secondary/50 rounded-full">
              {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
            </span>
            {story.is_free ? (
              <span className="px-2 py-1 bg-dream-DEFAULT/20 text-dream-DEFAULT rounded-full font-medium">
                Free
              </span>
            ) : (
              <span className="px-2 py-1 bg-moon-DEFAULT/20 text-moon-dark rounded-full font-medium">
                Premium
              </span>
            )}
          </div>
        </div>
        
        {/* Language Selector */}
        {story.languages.length > 1 && (
          <div className="mb-6">
            <Tabs value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as any)}>
              <TabsList>
                {story.languages.includes('en') && (
                  <TabsTrigger value="en">English</TabsTrigger>
                )}
                {story.languages.includes('ar-eg') && (
                  <TabsTrigger value="ar-eg">Arabic (Egyptian)</TabsTrigger>
                )}
                {story.languages.includes('ar-fos7a') && (
                  <TabsTrigger value="ar-fos7a">Arabic (Fos7a)</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}
        
        {/* Story Content */}
        {canAccessStory ? (
          <>
            <Card className="overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm mb-6">
              <div className="md:flex">
                {/* Story Scene Image */}
                <div className="md:w-1/2">
                  {currentScene?.image ? (
                    <img 
                      src={currentScene.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover aspect-square md:aspect-auto"
                      onError={(e) => {
                        console.log('Image failed to load:', currentScene.image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center aspect-square md:aspect-auto">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Story Scene Text */}
                <div className="md:w-1/2 p-6 flex flex-col">
                  <div className="flex-grow">
                    <p className="text-lg leading-relaxed">
                      {currentScene?.text || "Story content coming soon..."}
                    </p>
                  </div>
                  
                  {/* Scene Navigation */}
                  <div className="flex justify-between items-center pt-4 mt-auto">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handlePrevScene} 
                      disabled={currentSceneIndex === 0}
                      aria-label="Previous scene"
                    >
                      <ChevronLeft className="rtl:rotate-180 h-5 w-5" />
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      {currentSceneIndex + 1} / {scenes.length}
                    </span>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleNextScene} 
                      disabled={currentSceneIndex === scenes.length - 1}
                      aria-label="Next scene"
                    >
                      <ChevronRight className="rtl:rotate-180 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Audio Controls */}
            <div className="flex justify-center mb-8">
              <Button 
                onClick={toggleAudio} 
                variant="outline" 
                className="rounded-full"
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" /> Mute Narration
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Play Narration
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Card className="p-8 text-center border-moon-DEFAULT/30 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
            <h3 className="text-2xl font-bubbly mb-4 text-moon-dark">Premium Story</h3>
            <p className="mb-6 max-w-md mx-auto">
              This is a premium story. Subscribe to our premium plan to unlock this story and many more!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/subscription")} className="bg-moon-DEFAULT hover:bg-moon-dark">
                See Subscription Plans
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Log In
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Story;
