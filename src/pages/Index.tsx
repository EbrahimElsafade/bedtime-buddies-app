
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { stories, getFeaturedStories, getFreeStories } from "@/data/stories";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const featuredStories = getFeaturedStories().slice(0, 3);
  const freeStory = getFreeStories()[0];
  
  useEffect(() => {
    document.title = "Bedtime Stories - Soothing Stories for Kids";
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bubbly mb-4 bg-clip-text text-transparent bg-gradient-to-r from-dream-light via-dream-DEFAULT to-dream-dark">
              Sweet Dreams Begin with Magical Stories
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground">
              Discover soothing bedtime stories in multiple languages that will take your child on magical adventures while preparing them for peaceful sleep.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/stories">
                <Button size="lg" className="rounded-full bg-dream-DEFAULT hover:bg-dream-dark">
                  Explore Stories <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="rounded-full border-dream-light">
                    Sign Up Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 transform -translate-y-1/2 w-20 h-20 rounded-full bg-moon-light opacity-30 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-dream-light opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-10 right-20 w-8 h-8 rounded-full bg-dream-DEFAULT opacity-10 animate-twinkle"></div>
      </section>

      {/* Free Story of the Day */}
      {freeStory && (
        <section className="py-12 px-4 bg-gradient-to-b from-transparent to-dream-light/10">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bubbly">Free Story of the Day</h2>
              <Link to="/stories" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <Card className="story-card overflow-hidden border-2 border-moon-light/50 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="md:flex">
                <div className="md:w-1/3 aspect-[3/2] md:aspect-auto relative">
                  <img 
                    src={freeStory.coverImage} 
                    alt={freeStory.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                    FREE
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <CardTitle className="text-xl md:text-2xl mb-2">{freeStory.title}</CardTitle>
                  <CardDescription className="mb-4">{freeStory.description}</CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground mb-6">
                    <span className="mr-4">{freeStory.duration} mins</span>
                    <span>{freeStory.languages.map(lang => {
                      if (lang === 'en') return 'English';
                      if (lang === 'ar-eg') return 'Arabic (Egyptian)';
                      if (lang === 'ar-fos7a') return 'Arabic (Fos7a)';
                      return '';
                    }).join(', ')}</span>
                  </div>
                  <Link to={`/stories/${freeStory.id}`}>
                    <Button>Read Story</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Featured Stories */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bubbly mb-6">Featured Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStories.map((story) => (
              <Card key={story.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
                <div className="aspect-[3/2] relative">
                  <img 
                    src={story.coverImage} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                  {story.isFree && (
                    <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                      FREE
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{story.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-4">{story.duration} mins</span>
                    <span>{story.category.charAt(0).toUpperCase() + story.category.slice(1)}</span>
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
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bubbly mb-4">Why Parents & Kids Love Us</h2>
            <p className="text-muted-foreground">
              Our stories are crafted to bring families together with calming narratives, 
              educational themes, and a touch of magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="text-xl font-bubbly mb-2">Soothing Stories</h3>
              <p className="text-muted-foreground">
                Calming narratives specially crafted to help children relax and prepare for sleep.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
                <span className="text-2xl">🌎</span>
              </div>
              <h3 className="text-xl font-bubbly mb-2">Multiple Languages</h3>
              <p className="text-muted-foreground">
                Stories available in English, Egyptian Arabic, and Standard Arabic to support language development.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-dream-light flex items-center justify-center mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bubbly mb-2">Family Games</h3>
              <p className="text-muted-foreground">
                Fun interactive activities that parents and children can enjoy together before bedtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-dream-DEFAULT to-dream-dark text-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bubbly mb-4">Unlock Premium Stories & Features</h2>
            <p className="mb-6">
              Get unlimited access to our full library of stories, exclusive content,
              and special features with our premium subscription.
            </p>
            <Link to="/subscription">
              <Button size="lg" variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-dream-DEFAULT">
                See Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
