
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, BookOpen, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getCourseById, CourseVideo } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  
  const course = courseId ? getCourseById(courseId) : undefined;
  const isPremium = profile?.is_premium || false;
  
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | Bedtime Stories`;
      // Set the first video as selected by default if there are videos
      if (course.videos && course.videos.length > 0) {
        setSelectedVideo(course.videos[0]);
      }
    } else {
      document.title = "Course Not Found | Bedtime Stories";
    }
  }, [course]);
  
  const handleStartCourse = () => {
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired'),
        description: t('toast.pleaseLoginToStart'),
        variant: "destructive"
      });
      return;
    }
    
    if (!course?.isFree && !isPremium) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: "destructive"
      });
      return;
    }
    
    // If authentication and premium check passes, we would start the course
    toast({
      title: t('toast.courseStarted'),
      description: `${t('toast.enjoyLearning')} ${course?.title}!`,
    });
    
    // Select first video and switch to content tab
    if (course?.videos && course.videos.length > 0) {
      setSelectedVideo(course.videos[0]);
      setActiveTab("content");
    }
  };
  
  const handleVideoSelect = (video: CourseVideo) => {
    if (!video.isFree && !isPremium && !course?.isFree) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: "destructive"
      });
      return;
    }
    setSelectedVideo(video);
  };
  
  if (!course) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-3xl font-bubbly mb-6 text-dream-DEFAULT">
          {t('course.notFound')}
        </h1>
        <p className="mb-8 text-dream-DEFAULT dark:text-foreground">
          {t('course.notFoundDesc')}
        </p>
        <Link to="/courses">
          <Button variant="outline" className="border-dream-DEFAULT text-dream-DEFAULT">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-12 px-4 relative">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-dream-light/10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-moon-light/10 animate-float" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="container mx-auto">
        <Link to="/courses" className="inline-flex items-center text-dream-DEFAULT hover:text-dream-dark mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses')}
        </Link>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Course Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3">
              <Card className="overflow-hidden border-dream-light/30">
                <img 
                  src={course.coverImage} 
                  alt={course.title} 
                  className="w-full h-auto aspect-[4/3] object-cover"
                />
              </Card>
            </div>
            
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bubbly mb-4 text-dream-DEFAULT">{course.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-dream-light/30 text-dream-DEFAULT border-none">
                  {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                </Badge>
                <Badge className="bg-moon-light/30 text-dream-DEFAULT border-none">
                  {course.ageRange} {t('courses.years')}
                </Badge>
                {course.isFree ? (
                  <Badge className="bg-dream-DEFAULT/80 text-white border-none">
                    {t('free.tag')}
                  </Badge>
                ) : (
                  <Badge className="bg-moon-DEFAULT/80 text-white border-none">
                    {t('premium.tag')}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-dream-DEFAULT dark:text-foreground">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{course.duration} {t('duration')}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{course.lessons} {t('courses.lessons')}</span>
                </div>
              </div>
              
              <p className="mb-6 text-dream-DEFAULT dark:text-foreground">{course.description}</p>
              
              <Button 
                onClick={handleStartCourse}
                className={cn(
                  "px-8 py-2 rounded-full", 
                  course.isFree 
                    ? "bg-dream-DEFAULT hover:bg-dream-dark text-white" 
                    : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                )}
              >
                {course.isFree 
                  ? t('button.startLearning')
                  : isAuthenticated && isPremium 
                    ? t('button.startLearning')
                    : t('button.goToPremium')}
              </Button>
            </div>
          </div>
          
          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="overview" className="text-dream-DEFAULT">
                {t('course.overview')}
              </TabsTrigger>
              <TabsTrigger value="content" className="text-dream-DEFAULT">
                {t('course.content')}
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="prose prose-dream max-w-none mb-8 text-dream-DEFAULT dark:text-foreground">
                <h2 className="text-xl font-bubbly mb-3 text-dream-DEFAULT">{t('course.about')}</h2>
                <p>{course.description}</p>
                
                <h2 className="text-xl font-bubbly mt-6 mb-3 text-dream-DEFAULT">{t('course.whatYouLearn')}</h2>
                <ul className="list-disc pl-5">
                  <li>{t('course.learnPoint1')}</li>
                  <li>{t('course.learnPoint2')}</li>
                  <li>{t('course.learnPoint3')}</li>
                </ul>
              </div>
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player */}
                <div className="lg:col-span-2">
                  {selectedVideo ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe 
                          src={selectedVideo.videoUrl}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div>
                        <h3 className="text-xl font-bubbly text-dream-DEFAULT mb-2">
                          {selectedVideo.title}
                        </h3>
                        <div className="flex items-center mb-2 text-sm text-dream-DEFAULT dark:text-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{selectedVideo.duration} {t('duration')}</span>
                        </div>
                        <p className="text-dream-DEFAULT dark:text-foreground">
                          {selectedVideo.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                      <p className="text-center text-muted-foreground">
                        {t('course.selectVideo')}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Video List */}
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bubbly text-dream-DEFAULT mb-4">
                    {t('course.courseVideos')}
                  </h3>
                  
                  <div className="space-y-3">
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map((video) => (
                        <Card 
                          key={video.id}
                          className={cn(
                            "cursor-pointer hover:border-dream-DEFAULT transition-all",
                            selectedVideo?.id === video.id && "border-dream-DEFAULT"
                          )}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="relative w-24 h-16 flex-shrink-0">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover rounded"
                                />
                                {!video.isFree && !course.isFree && !isPremium && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                    <Lock className="h-6 w-6 text-white" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="h-8 w-8 rounded-full bg-dream-DEFAULT flex items-center justify-center">
                                    <Play className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-dream-DEFAULT font-medium text-sm truncate">
                                  {video.title}
                                </h4>
                                <div className="flex items-center mt-1 text-xs text-dream-DEFAULT/70">
                                  <Clock className="mr-1 h-3 w-3" />
                                  <span>{video.duration} {t('duration')}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t('course.noVideos')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Course;
