
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { getFeaturedCourses } from "@/data/courses";
import { cn } from "@/lib/utils";

const FeaturedCourses = () => {
  const { t } = useTranslation(['misc', 'stories']);
  const featuredCourses = getFeaturedCourses().slice(0, 3);
  
  if (!featuredCourses.length) return null;

  return (
    <section className="py-12 px-4 bg-secondary/50 relative">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bubbly text-dream-DEFAULT">
            {t('misc:courses.title')}
          </h2>
          <Link to="/courses" className="text-dream-DEFAULT hover:text-dream-dark text-sm font-medium flex items-center">
            {t('misc:free.viewAll')} <ArrowRight className="rtl:rotate-180 ms-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="story-card overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
              <div className="aspect-[3/2] relative">
                <img 
                  src={course.coverImage} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                {course.isFree ? (
                  <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                    {t('misc:free.tag')}
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                    {t('misc:premium.tag')}
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-nightsky-light/80 text-xs px-2 py-1 rounded-full text-dream-DEFAULT">
                  {course.ageRange} {t('misc:courses.years')}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-dream-DEFAULT">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="bg-dream-light/30 text-dream-DEFAULT">
                    {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-dream-DEFAULT">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{course.lessons} {t('misc:courses.lessons')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration} {t('misc:duration')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/courses/${course.id}`} className="w-full">
                  <Button 
                    className={cn(
                      "w-full", 
                      course.isFree 
                        ? "bg-dream-DEFAULT hover:bg-dream-dark hover:text-white text-black dark:text-white" 
                        : "bg-moon-DEFAULT hover:bg-moon-dark hover:text-white text-black dark:text-white"
                    )}
                  >
                    {course.isFree ? t('misc:button.startLearning') : t('misc:button.premium')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Fun decorative elements for courses section */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="opacity-10">
          <path fill="#8B5CF6" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default FeaturedCourses;
