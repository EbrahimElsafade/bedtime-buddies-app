
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, BookOpen, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useCourse, type CourseLessonFromDB } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const Course = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { isAuthenticated, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLesson, setSelectedLesson] = useState<CourseLessonFromDB | null>(null);
  
  const { data, isLoading, error } = useCourse(courseId || '');
  const course = data?.course;
  const lessons = useMemo(() => data?.lessons || [], [data?.lessons]);
  const isPremium = profile?.is_premium || false;
  
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | Bedtime Stories`;
      // Set the first lesson as selected by default if there are lessons
      if (lessons && lessons.length > 0) {
        setSelectedLesson(lessons[0]);
      }
    } else {
      document.title = "Course Not Found | Bedtime Stories";
    }
  }, [course, lessons]);
  
  const handleStartCourse = () => {
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired'),
        description: t('toast.pleaseLoginToStart'),
        variant: "destructive"
      });
      return;
    }
    
    if (!course?.is_free && !isPremium) {
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
    
    // Select first lesson and switch to content tab
    if (lessons && lessons.length > 0) {
      setSelectedLesson(lessons[0]);
      setActiveTab("content");
    }
  };
  
  const handleLessonSelect = (lesson: CourseLessonFromDB) => {
    // For now, all lessons are accessible if the course is free or user has premium
    if (!course?.is_free && !isPremium) {
      toast({
        title: t('toast.premiumRequired'),
        description: t('toast.upgradeToPremium'),
        variant: "destructive"
      });
      return;
    }
    setSelectedLesson(lesson);
  };

  if (isLoading) {
    return (
      <div className="py-12 px-4 relative">
        <div className="container mx-auto">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <Skeleton className="w-full h-64" />
              </div>
              <div className="md:w-2/3">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
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
                  src={course.cover_image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000'} 
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
                  {course.languages.join(', ')}
                </Badge>
                {course.is_free ? (
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
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{lessons.length} {t('courses.lessons')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="mb-6 text-dream-DEFAULT dark:text-foreground">{course.description}</p>
              
              <Button 
                onClick={handleStartCourse}
                className={cn(
                  "px-8 py-2 rounded-full", 
                  course.is_free 
                    ? "bg-dream-DEFAULT hover:bg-dream-dark text-white" 
                    : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                )}
              >
                {course.is_free 
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
                  <li>Interactive lessons designed for young learners</li>
                  <li>Progressive skill building and knowledge retention</li>
                  <li>Fun activities to keep children engaged</li>
                </ul>
              </div>
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player */}
                <div className="lg:col-span-2">
                  {selectedLesson?.video_url ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe 
                          src={selectedLesson.video_url}
                          title={selectedLesson.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div>
                        <h3 className="text-xl font-bubbly text-dream-DEFAULT mb-2">
                          {selectedLesson.title}
                        </h3>
                        <div className="flex items-center mb-2 text-sm text-dream-DEFAULT dark:text-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{selectedLesson.duration} minutes</span>
                        </div>
                        <p className="text-dream-DEFAULT dark:text-foreground">
                          {selectedLesson.description}
                        </p>
                      </div>
                    </div>
                  ) : selectedLesson ? (
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-xl font-bubbly text-dream-DEFAULT mb-2">
                          {selectedLesson.title}
                        </h3>
                        <p className="text-center text-muted-foreground mb-4">
                          Video coming soon for this lesson
                        </p>
                        <div className="flex items-center justify-center mb-2 text-sm text-dream-DEFAULT dark:text-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{selectedLesson.duration} minutes</span>
                        </div>
                        <p className="text-dream-DEFAULT dark:text-foreground max-w-md">
                          {selectedLesson.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                      <p className="text-center text-muted-foreground">
                        Select a lesson to start learning
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Lesson List */}
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bubbly text-dream-DEFAULT mb-4">
                    Course Lessons
                  </h3>
                  
                  <div className="space-y-3">
                    {lessons && lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <Card 
                          key={lesson.id}
                          className={cn(
                            "cursor-pointer hover:border-dream-DEFAULT transition-all",
                            selectedLesson?.id === lesson.id && "border-dream-DEFAULT"
                          )}
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="relative w-12 h-12 flex-shrink-0 rounded-full bg-dream-light/20 flex items-center justify-center">
                                <span className="text-dream-DEFAULT font-bold text-sm">
                                  {lesson.lesson_order}
                                </span>
                                {!course.is_free && !isPremium && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                    <Lock className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                {lesson.video_url && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-dream-DEFAULT flex items-center justify-center">
                                    <Play className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-dream-DEFAULT font-medium text-sm">
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center mt-1 text-xs text-dream-DEFAULT/70">
                                  <Clock className="mr-1 h-3 w-3" />
                                  <span>{lesson.duration} minutes</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No lessons available yet
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
