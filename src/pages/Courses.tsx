
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
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = "Bedtime Stories - Learn with Courses";
    
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery]);

  const filterByCategory = (category: Course['category'] | 'all') => {
    if (category === 'all') {
      return courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return courses.filter(course => 
      course.category === category &&
      (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <div className="py-12 px-4 relative">
      {/* Fun decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-dream-light/10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-moon-light/10 animate-float" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6 text-dream-DEFAULT">
          {t('courses.exploreTitle') || 'Learn with Fun Courses'}
        </h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('courses.searchPlaceholder') || "Search for courses..."}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 w-full max-w-2xl grid grid-cols-6 h-auto">
              <TabsTrigger value="all" onClick={() => setFilteredCourses(filterByCategory('all'))}>
                {t('courses.allCourses') || 'All Courses'}
              </TabsTrigger>
              <TabsTrigger value="language" onClick={() => setFilteredCourses(filterByCategory('language'))}>
                {t('courses.categories.language') || 'Language'}
              </TabsTrigger>
              <TabsTrigger value="math" onClick={() => setFilteredCourses(filterByCategory('math'))}>
                {t('courses.categories.math') || 'Math'}
              </TabsTrigger>
              <TabsTrigger value="science" onClick={() => setFilteredCourses(filterByCategory('science'))}>
                {t('courses.categories.science') || 'Science'}
              </TabsTrigger>
              <TabsTrigger value="arts" onClick={() => setFilteredCourses(filterByCategory('arts'))}>
                {t('courses.categories.arts') || 'Arts'}
              </TabsTrigger>
              <TabsTrigger value="social" onClick={() => setFilteredCourses(filterByCategory('social'))}>
                {t('courses.categories.social') || 'Social'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">{t('courses.noResults') || 'No courses found matching your search.'}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="story-card overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
              <div className="aspect-[3/2] relative">
                <img 
                  src={course.coverImage} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-nightsky-light/80 text-xs px-2 py-1 rounded-full text-dream-DEFAULT">
                  {course.ageRange} {t('courses.years') || 'years'}
                </div>
                {course.isFree ? (
                  <div className="absolute top-2 left-2 bg-dream-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                    {t('free.tag') || 'FREE'}
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-moon-DEFAULT text-white text-xs font-medium px-2 py-1 rounded-full">
                    {t('premium.tag') || 'PREMIUM'}
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
                    <span>{course.lessons} {t('courses.lessons') || 'lessons'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration} {t('duration') || 'mins'}</span>
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
                    {course.isFree ? t('button.startLearning') || 'Start Learning' : t('button.premium') || 'Premium'}
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

export default Courses;
