import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Course, CourseVideo, Category } from '@/types/course'
import { Database } from '@/integrations/supabase/types'

type CourseRow = Database['public']['Tables']['courses']['Row']
type LessonRow = Database['public']['Tables']['course_lessons']['Row']
type CategoryRow = Database['public']['Tables']['course_categories']['Row']

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
      // Ignore DB-provided durations (we switched to YouTube embeds)
      // Duration will be computed on the client from the iframe/player
      const videos: CourseVideo[] =
        lessonsData?.map((lesson: LessonRow) => {
          return {
            id: lesson.id,
            title_en: lesson.title_en || lesson.title || '',
            title_ar: lesson.title_ar || '',
            title_fr: lesson.title_fr || '',
            description_en: lesson.description_en || lesson.description || '',
            description_ar: lesson.description_ar || '',
            description_fr: lesson.description_fr || '',
            videoPath: lesson.video_path || '',
            videoUrl: lesson.video_url || '',
            thumbnailPath: lesson.thumbnail_path || '',
            duration: 0, // ignore DB duration
            isFree: lesson.is_free ?? courseData.is_free,
            order: lesson.lesson_order,
            createdAt: lesson.created_at || '',
          };
        }) || []

      const course = courseData as CourseRow;
      return {
        id: course.id,
        title: course.title_en || '',
        title_en: course.title_en || '',
        title_ar: course.title_ar || '',
        title_fr: course.title_fr || '',
        description: course.description_en || '',
        description_en: course.description_en || '',
        description_ar: course.description_ar || '',
        description_fr: course.description_fr || '',
        category: courseData.category || '',
        minAge: courseData.min_age || 3,
        maxAge: courseData.max_age || 12,
        duration: courseData.total_duration || 0, // Use stored total_duration
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
        learning_objectives_en: courseData.learning_objectives_en || [],
        learning_objectives_ar: courseData.learning_objectives_ar || [],
        learning_objectives_fr: courseData.learning_objectives_fr || [],
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
        coursesData?.map((courseData: CourseRow) => {
          return {
            id: courseData.id,
            title: courseData.title_en || '',
            title_en: courseData.title_en || '',
            title_ar: courseData.title_ar || '',
            title_fr: courseData.title_fr || '',
            description: courseData.description_en || '',
            description_en: courseData.description_en || '',
            description_ar: courseData.description_ar || '',
            description_fr: courseData.description_fr || '',
            category: courseData.category || '',
            minAge: courseData.min_age || 3,
            maxAge: courseData.max_age || 12,
            duration: courseData.total_duration || 0, // Use stored total_duration
            lessons: courseData.lessons || 0,
            cover_image: courseData.cover_image || '',
            coverImagePath: courseData.cover_image || '',
            is_free: courseData.is_free,
            isFeatured: courseData.is_published,
            isFree: courseData.is_free,
            is_published: courseData.is_published,
            languages: courseData.languages || ['en'],
            createdAt: courseData.created_at,
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
        .limit(6)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Error fetching featured courses:', coursesError)
        throw coursesError
      }

      return (
        coursesData?.map((courseData: CourseRow) => {
          return {
            id: courseData.id,
            title: courseData.title_en || '',
            title_en: courseData.title_en || '',
            title_ar: courseData.title_ar || '',
            title_fr: courseData.title_fr || '',
            description: courseData.description_en || '',
            description_en: courseData.description_en || '',
            description_ar: courseData.description_ar || '',
            description_fr: courseData.description_fr || '',
            category: courseData.category || '',
            minAge: courseData.min_age || 3,
            maxAge: courseData.max_age || 12,
            duration: courseData.total_duration || 0, // Use stored total_duration
            lessons: courseData.lessons || 0,
            cover_image: courseData.cover_image || '',
            coverImagePath: courseData.cover_image || '',
            is_free: courseData.is_free,
            isFeatured: true,
            isFree: courseData.is_free,
            is_published: courseData.is_published,
            languages: courseData.languages || ['en'],
            createdAt: courseData.created_at,
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
        data?.map((categoryData: CategoryRow) => {
          return {
            id: categoryData.id,
            name_en: categoryData.name_en || categoryData.name || '',
            name_ar: categoryData.name_ar || '',
            name_fr: categoryData.name_fr || '',
            description_en: categoryData.description_en || '',
            description_ar: categoryData.description_ar || '',
            description_fr: categoryData.description_fr || '',
            name: categoryData.name, // Keep for backwards compatibility
            created_at: categoryData.created_at,
            updated_at: categoryData.updated_at,
          };
        }) || []
      )
    },
  })
}
