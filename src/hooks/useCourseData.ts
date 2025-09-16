import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Course, CourseVideo, Category } from '@/types/course'
import { Database } from '@/integrations/supabase/types'

type CourseRow = Database['public']['Tables']['courses']['Row']

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
        lessonsData?.map(lesson => {
          const lessonData = lesson as any;
          return {
            id: lessonData.id,
            title_en: lessonData.title_en || lessonData.title || '',
            title_ar: lessonData.title_ar || '',
            title_fr: lessonData.title_fr || '',
            description_en: lessonData.description_en || lessonData.description || '',
            description_ar: lessonData.description_ar || '',
            description_fr: lessonData.description_fr || '',
            videoPath: lessonData.video_path || '',
            thumbnailPath: lessonData.thumbnail_path || '',
            duration: lessonData.duration,
            isFree: courseData.is_free,
            order: lessonData.lesson_order,
            createdAt: lessonData.created_at,
          };
        }) || []

      const course = courseData as any;
      return {
        id: course.id,
        title: course.title_en || course.title || '',
        title_en: course.title_en || course.title || '',
        title_ar: course.title_ar || '',
        title_fr: course.title_fr || '',
        description: course.description_en || course.description || '',
        description_en: course.description_en || course.description || '',
        description_ar: course.description_ar || '',
        description_fr: course.description_fr || '',
        category: courseData.category || '',
        minAge: courseData.min_age || 3,
        maxAge: courseData.max_age || 12,
        duration: 0, // Will be calculated from lessons duration
        lessons: courseData.lessons || videos.length,
        cover_image: courseData.cover_image || '',
        coverImagePath: courseData.cover_image || '',
        is_free: courseData.is_free,
        isFeatured: courseData.is_published,
        isFree: courseData.is_free,
        is_published: courseData.is_published,
        languages: courseData.languages || ['en'],
        videos,
        createdAt: courseData.created_at,
        learningObjectives: courseData.learning_objectives || [],
        instructor: course.instructor_name_en || course.instructor_name
          ? {
              name_en: course.instructor_name_en || course.instructor_name || '',
              name_ar: course.instructor_name_ar || '',
              name_fr: course.instructor_name_fr || '',
              bio_en: course.instructor_bio_en || course.instructor_bio || '',
              bio_ar: course.instructor_bio_ar || '',
              bio_fr: course.instructor_bio_fr || '',
              avatar: course.instructor_avatar || undefined,
              expertise: course.instructor_expertise || [],
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
        coursesData?.map(courseData => {
          const course = courseData as any;
          return {
            id: course.id,
            title: course.title_en || course.title || '',
            title_en: course.title_en || course.title || '',
            title_ar: course.title_ar || '',
            title_fr: course.title_fr || '',
            description: course.description_en || course.description || '',
            description_en: course.description_en || course.description || '',
            description_ar: course.description_ar || '',
            description_fr: course.description_fr || '',
            category: course.category || '',
            minAge: course.min_age || 3,
            maxAge: course.max_age || 12,
            duration: 0, // Will be calculated from lessons duration
            lessons: course.lessons || 0,
            cover_image: course.cover_image || '',
            coverImagePath: course.cover_image || '',
            is_free: course.is_free,
            isFeatured: course.is_published,
            isFree: course.is_free,
            is_published: course.is_published,
            languages: course.languages || ['en'],
            createdAt: course.created_at,
          };
        }) || []
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
        coursesData?.map(courseData => {
          const course = courseData as any;
          return {
            id: course.id,
            title: course.title_en || course.title || '',
            title_en: course.title_en || course.title || '',
            title_ar: course.title_ar || '',
            title_fr: course.title_fr || '',
            description: course.description_en || course.description || '',
            description_en: course.description_en || course.description || '',
            description_ar: course.description_ar || '',
            description_fr: course.description_fr || '',
            category: course.category || '',
            minAge: course.min_age || 3,
            maxAge: course.max_age || 12,
            duration: 0, // Will be calculated from lessons duration
            lessons: course.lessons || 0,
            cover_image: course.cover_image || '',
            coverImagePath: course.cover_image || '',
            is_free: course.is_free,
            isFeatured: true,
            isFree: course.is_free,
            is_published: course.is_published,
            languages: course.languages || ['en'],
            createdAt: course.created_at,
          };
        }) || []
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
        data?.map(categoryData => {
          const category = categoryData as any;
          return {
            id: category.id,
            name_en: category.name_en || category.name || '',
            name_ar: category.name_ar || '',
            name_fr: category.name_fr || '',
            description_en: category.description_en || '',
            description_ar: category.description_ar || '',
            description_fr: category.description_fr || '',
            name: category.name, // Keep for backwards compatibility
            created_at: category.created_at,
            updated_at: category.updated_at,
          };
        }) || []
      )
    },
  })
}
