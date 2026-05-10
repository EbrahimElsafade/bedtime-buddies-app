import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface CourseProgress {
  completedLessons: string[]
  totalLessons: number
  courseProgress: number // 0-100
  isComplete: boolean
}

/**
 * Tracks course progress based on opened/completed lessons stored in
 * `user_section_progress`. A lesson is considered completed once the user
 * has opened it (matching the gamification behavior).
 */
export const useCourseProgress = (
  courseId: string | undefined,
  totalLessons: number,
) => {
  const { user, isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: ['course-progress', courseId, user?.id, totalLessons],
    enabled: !!courseId && !!user && isAuthenticated,
    queryFn: async (): Promise<CourseProgress> => {
      if (!courseId || !user) {
        return {
          completedLessons: [],
          totalLessons,
          courseProgress: 0,
          isComplete: false,
        }
      }

      const { data, error } = await supabase
        .from('user_section_progress')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('content_type', 'course_lesson')
        .eq('parent_id', courseId)

      if (error) throw error

      const completedLessons = (data || []).map(d => d.content_id as string)
      const safeTotal = totalLessons > 0 ? totalLessons : 0
      const progress =
        safeTotal === 0
          ? 0
          : Math.min(
              100,
              Math.round((completedLessons.length / safeTotal) * 100),
            )

      return {
        completedLessons,
        totalLessons: safeTotal,
        courseProgress: progress,
        isComplete: safeTotal > 0 && completedLessons.length >= safeTotal,
      }
    },
  })

  return {
    ...(query.data ?? {
      completedLessons: [] as string[],
      totalLessons,
      courseProgress: 0,
      isComplete: false,
    }),
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
