
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { courses, Course } from "@/data/courses";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
  const [activeCategory, setActiveCategory] = useState<Course['category'] | 'all'>('all');
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = "Bedtime Stories - Learn with Courses";
    
    const filtered = courses.filter(course => 
      (activeCategory === 'all' || course.category === activeCategory) &&
      (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery, activeCategory]);

  const handleCategoryChange = (category: Course['category'] | 'all') => {
    setActiveCategory(category);
  };

  const getAgeCounts = () => {
    const counts: Record<string, number> = {};
    courses.forEach(course => {
      if (!counts[course.ageRange]) {
        counts[course.ageRange] = 0;
      }
      counts[course.ageRange]++;
    });
    return counts;
  };
  
  const ageCounts = getAgeCounts();
  
  return (
    <div className="py-12 px-4 relative">
      {/* Fun decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-dream-light/10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-moon-light/10 animate-float" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6 text-dream-DEFAULT">
          {t('courses.exploreTitle')}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-nightsky-light/80 rounded-lg p-6 backdrop-blur-sm sticky top-24">
              <h3 className="text-xl font-bubbly mb-4 text-dream-DEFAULT">{t('courses.allCourses')}</h3>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('courses.searchPlaceholder')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category Filters */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-dream-DEFAULT">{t('courses.categories.language')}</h4>
                <div className="flex flex-col space-y-1.5">
                  <Button
                    variant={activeCategory === 'all' ? "default" : "ghost"}
                    className={activeCategory === 'all' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('all')}
                  >
                    {t('courses.allCourses')} ({courses.length})
                  </Button>
                  <Button
                    variant={activeCategory === 'language' ? "default" : "ghost"}
                    className={activeCategory === 'language' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('language')}
                  >
                    {t('courses.categories.language')} ({courses.filter(c => c.category === 'language').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'math' ? "default" : "ghost"}
                    className={activeCategory === 'math' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('math')}
                  >
                    {t('courses.categories.math')} ({courses.filter(c => c.category === 'math').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'science' ? "default" : "ghost"}
                    className={activeCategory === 'science' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('science')}
                  >
                    {t('courses.categories.science')} ({courses.filter(c => c.category === 'science').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'arts' ? "default" : "ghost"}
                    className={activeCategory === 'arts' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('arts')}
                  >
                    {t('courses.categories.arts')} ({courses.filter(c => c.category === 'arts').length})
                  </Button>
                  <Button
                    variant={activeCategory === 'social' ? "default" : "ghost"}
                    className={activeCategory === 'social' ? "bg-dream-DEFAULT text-white" : "text-dream-DEFAULT"}
                    onClick={() => handleCategoryChange('social')}
                  >
                    {t('courses.categories.social')} ({courses.filter(c => c.category === 'social').length})
                  </Button>
                </div>
              </div>
              
              {/* Age Range Filters */}
              <div>
                <h4 className="font-medium mb-2 text-dream-DEFAULT">{t('courses.years')}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ageCounts).map(([age, count]) => (
                    <Badge key={age} variant="outline" className="bg-dream-light/20 border-dream-light">
                      {age} {t('courses.years')} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-white/70 dark:bg-nightsky-light/70 rounded-lg">
                <p className="text-lg text-dream-DEFAULT">{t('courses.noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="story-card overflow-hidden border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm hover:shadow-lg transition-all">
                    <div className="aspect-[3/2] relative">
                      <img 
                        src={course.coverImage} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/80 dark:bg-nightsky-light/80 text-xs px-2 py-1 rounded-full text-dream-DEFAULT">
                        {course.ageRange} {t('courses.years')}
                      </div>
                      {course.isFree ? (
                        <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                          {t('free.tag')}
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                          {t('premium.tag')}
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-dream-DEFAULT">{course.title}</CardTitle>
                        <Badge className="bg-dream-light/30 text-dream-DEFAULT border-none">
                          {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-dream-DEFAULT dark:text-foreground">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm text-dream-DEFAULT dark:text-foreground">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.lessons} {t('courses.lessons')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{course.duration} {t('duration')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/courses/${course.id}`} className="w-full">
                        <Button 
                          className={cn(
                            "w-full", 
                            course.isFree 
                              ? "bg-dream-DEFAULT hover:bg-dream-dark text-white dark:text-white" 
                              : "bg-moon-DEFAULT hover:bg-moon-dark text-dream-DEFAULT dark:text-white"
                          )}
                        >
                          {course.isFree ? t('button.startLearning') : t('button.premium')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
