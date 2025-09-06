import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CourseFromDB = {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image: string | null;
  languages: string[];
  is_free: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseLessonFromDB = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  lesson_order: number;
  duration: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }

      return data as CourseFromDB[];
    },
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }

      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching course lessons:', lessonsError);
        throw lessonsError;
      }

      return {
        course: course as CourseFromDB,
        lessons: lessons as CourseLessonFromDB[],
      };
    },
    enabled: !!courseId,
  });
};

export const useFeaturedCourses = () => {
  return useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      // For now, we'll just return the first 3 courses as featured
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured courses:', error);
        throw error;
      }

      return data as CourseFromDB[];
    },
  });
};