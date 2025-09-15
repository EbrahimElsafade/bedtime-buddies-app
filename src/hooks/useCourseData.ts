import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Course, CourseVideo, Category } from '@/types/course'
import { Database } from '@/integrations/supabase/types';

type CourseRow = Database['public']['Tables']['courses']['Row'];


export const useCourseData = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async (): Promise<Course> => {
      if (!courseId) throw new Error('Course ID is required')

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single()

      if (courseError) {
        console.error('Error fetching course:', courseError)
        throw courseError
      }

      // Fetch course lessons/videos
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order', { ascending: true })

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError)
        throw lessonsError
      }

      // Transform lessons to match our interface
      const videos: CourseVideo[] =
        lessonsData?.map(lesson => ({
          id: lesson.id,
          title_en: lesson.title,
          title_ar: lesson.title,
          title_fr: lesson.title,
          description_en: lesson.description,
          description_ar: lesson.description,
          description_fr: lesson.description,
          videoPath: lesson.video_path || '',
          thumbnailPath: lesson.thumbnail_path || '',
          duration: lesson.duration,
          isFree: courseData.is_free,
          order: lesson.lesson_order,
          createdAt: lesson.created_at,
        })) || []

      return {
        id: courseData.id,
        title_en: courseData.title,
        title_ar: courseData.title,
        title_fr: courseData.title,
        description_en: courseData.description,
        description_ar: courseData.description,
        description_fr: courseData.description,
        category: courseData.category || '',
        minAge: courseData.min_age || 3,
        maxAge: courseData.max_age || 12,
        duration: 0, // Will be calculated from lessons duration
        lessons: courseData.lessons || videos.length,
        coverImagePath: courseData.cover_image || '',
        isFeatured: courseData.is_published,
        isFree: courseData.is_free,
        videos,
        createdAt: courseData.created_at,
        learningObjectives: courseData.learning_objectives || [],
        instructor: courseData.instructor_name
          ? {
              name_en: courseData.instructor_name,
              name_ar: courseData.instructor_name,
              name_fr: courseData.instructor_name,
              bio_en: courseData.instructor_bio || '',
              bio_ar: courseData.instructor_bio || '',
              bio_fr: courseData.instructor_bio || '',
              avatar: courseData.instructor_avatar || undefined,
              expertise_en: courseData.instructor_expertise || [],
              expertise_ar: courseData.instructor_expertise || [],
              expertise_fr: courseData.instructor_expertise || [],
            }
          : undefined,
      }
    },
    enabled: !!courseId,
  })
}

export const useCoursesData = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<Course[]> => {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        throw coursesError
      }

      return (
        coursesData?.map(course => ({
          id: course.id,
          title_en: course.title,
          title_ar: course.title,
          title_fr: course.title,
          description_en: course.description,
          description_ar: course.description,
          description_fr: course.description,
          category: course.category || '',
          minAge: course.min_age || 3,
          maxAge: course.max_age || 12,
          duration: 0, // Will be calculated from lessons duration
          lessons: course.lessons || 0,
          coverImagePath: course.cover_image || '',
          isFeatured: course.is_published,
          isFree: course.is_free,
          createdAt: course.created_at,
        })) || []
      )
    },
  })
}

export const useFeaturedCourses = () => {
  return useQuery({
    queryKey: ['featured-courses'],
    queryFn: async (): Promise<Course[]> => {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .limit(3)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Error fetching featured courses:', coursesError)
        throw coursesError
      }

      return (
        coursesData?.map(course => ({
          id: course.id,
          title_en: course.title,
          title_ar: course.title,
          title_fr: course.title,
          description_en: course.description,
          description_ar: course.description,
          description_fr: course.description,
          category: course.category || '',
          minAge: course.min_age || 3,
          maxAge: course.max_age || 12,
          duration: 0, // Will be calculated from lessons duration
          lessons: course.lessons || 0,
          coverImagePath: course.cover_image || '',
          isFeatured: true,
          isFree: course.is_free,
          createdAt: course.created_at,
        })) || []
      )
    },
  })
}

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching course categories:', error)
        throw error
      }

      return (
        data?.map(category => ({
          id: category.id,
          name_en: category.name,
          name_ar: category.name,
          name_fr: category.name,
          created_at: category.created_at,
          updated_at: category.updated_at,
        })) || []
      )
    },
  })
}