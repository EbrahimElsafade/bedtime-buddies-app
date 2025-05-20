
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils"; // Added missing import for cn utility

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, user } = useAuth(); // Changed to use user instead of direct isPremium
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const course = courseId ? getCourseById(courseId) : undefined;
  const isPremium = user?.isPremium || false; // Extract isPremium from user object
  
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | Bedtime Stories`;
    } else {
      document.title = "Course Not Found | Bedtime Stories";
    }
  }, [course]);
  
  const handleStartCourse = () => {
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired') || "Login Required",
        description: t('toast.pleaseLoginToStart') || "Please log in to start this course.",
        variant: "destructive"
      });
      return;
    }
    
    if (!course?.isFree && !isPremium) {
      toast({
        title: t('toast.premiumRequired') || "Premium Required",
        description: t('toast.upgradeToPremium') || "Please upgrade to premium to access this course.",
        variant: "destructive"
      });
      return;
    }
    
    // If authentication and premium check passes, we would start the course
    toast({
      title: t('toast.courseStarted') || "Course Started",
      description: `${t('toast.enjoyLearning') || "Enjoy learning"} ${course?.title}!`,
    });
  };
  
  if (!course) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-3xl font-bubbly mb-6 text-dream-DEFAULT">
          {t('course.notFound') || "Course Not Found"}
        </h1>
        <p className="mb-8 text-dream-DEFAULT dark:text-foreground">
          {t('course.notFoundDesc') || "The course you are looking for does not exist."}
        </p>
        <Link to="/courses">
          <Button variant="outline" className="border-dream-DEFAULT text-dream-DEFAULT">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses') || "Back to Courses"}
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('button.backToCourses') || "Back to Courses"}
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="md:col-span-2 order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl font-bubbly mb-4 text-dream-DEFAULT">{course.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-dream-light/30 text-dream-DEFAULT border-none">
                {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
              </Badge>
              <Badge className="bg-moon-light/30 text-dream-DEFAULT border-none">
                {course.ageRange} {t('courses.years') || 'years'}
              </Badge>
              {course.isFree ? (
                <Badge className="bg-dream-DEFAULT/80 text-white border-none">
                  {t('free.tag') || 'FREE'}
                </Badge>
              ) : (
                <Badge className="bg-moon-DEFAULT/80 text-white border-none">
                  {t('premium.tag') || 'PREMIUM'}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-dream-DEFAULT dark:text-foreground">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{course.duration} {t('duration') || 'mins'}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{course.lessons} {t('courses.lessons') || 'lessons'}</span>
              </div>
            </div>
            
            <div className="prose prose-dream max-w-none mb-8 text-dream-DEFAULT dark:text-foreground">
              <h2 className="text-xl font-bubbly mb-3 text-dream-DEFAULT">{t('course.about') || 'About this Course'}</h2>
              <p>{course.description}</p>
              
              <h2 className="text-xl font-bubbly mt-6 mb-3 text-dream-DEFAULT">{t('course.whatYouLearn') || 'What You Will Learn'}</h2>
              <ul className="list-disc pl-5">
                <li>{t('course.learnPoint1') || 'Fun and interactive lessons suitable for kids'}</li>
                <li>{t('course.learnPoint2') || 'Engaging activities to reinforce learning'}</li>
                <li>{t('course.learnPoint3') || 'Progress tracking to celebrate achievements'}</li>
              </ul>
            </div>
            
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
                ? t('button.startLearning') || 'Start Learning' 
                : isAuthenticated && isPremium 
                  ? t('button.startLearning') || 'Start Learning'
                  : t('button.goToPremium') || 'Go Premium'}
            </Button>
          </div>
          
          {/* Course Image */}
          <div className="mb-6 md:mb-0 order-1 md:order-2">
            <Card className="overflow-hidden border-dream-light/30">
              <img 
                src={course.coverImage} 
                alt={course.title} 
                className="w-full h-auto aspect-[4/3] object-cover"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
