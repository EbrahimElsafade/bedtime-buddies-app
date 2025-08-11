
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Courses = () => {
  const { t } = useTranslation(['misc']);
  const { language } = useLanguage();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          course_lessons(count)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>{t('misc:loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-dream-DEFAULT mb-4">
          {t('misc:courses.featured')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('misc:courses.description')}
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const title = getMultilingualText(course.title, language);
            const description = getMultilingualText(course.description, language);
            const lessonCount = course.course_lessons?.[0]?.count || 0;
            
            return (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.cover_image || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      {course.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{t('misc:courses.lessons', { count: lessonCount })}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={`/course/${course.id}`}>
                    <Button className="w-full">
                      {t('misc:courses.startCourse')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {t('misc:courses.noCourses')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
