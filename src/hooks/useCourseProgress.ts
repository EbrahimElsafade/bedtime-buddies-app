import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface CourseLessonProgress {
  lessonId: string
  watchedSeconds: number
  durationSeconds: number
  watchedPercent: number
  completedAt: string | null
  lastWatchedAt: string | null
}

export interface CourseProgress {
  completedLessons: string[]
  lessonProgress: Record<string, CourseLessonProgress>
  totalLessons: number
  courseProgress: number // 0-100
  isComplete: boolean
}

const EMPTY: CourseProgress = {
  completedLessons: [],
  lessonProgress: {},
  totalLessons: 0,
  courseProgress: 0,
  isComplete: false,
}

export const courseProgressKey = (courseId?: string, userId?: string) =>
  ['course-progress', courseId, userId] as const

/**
 * Accurate course progress:
 *  - Total lessons = COUNT(course_lessons.id) for the course (source of truth).
 *  - Completed lessons = rows in `user_section_progress` for this user+course.
 *  - Per-lesson watch data comes from `course_lesson_watch_progress` so the UI
 *    can show partial progress, completion checks, and last-watched info.
 */
export const useCourseProgress = (courseId: string | undefined) => {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: courseProgressKey(courseId, user?.id),
    enabled: !!courseId,
    queryFn: async (): Promise<CourseProgress> => {
      if (!courseId) return EMPTY

      // Total lessons — always derived from the actual lessons table.
      const { count: totalCount, error: countError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)

      if (countError) throw countError
      const totalLessons = totalCount ?? 0

      if (!user || !isAuthenticated) {
        return { ...EMPTY, totalLessons }
      }

      const [completedRes, watchRes] = await Promise.all([
        supabase
          .from('user_section_progress')
          .select('content_id')
          .eq('user_id', user.id)
          .eq('content_type', 'course_lesson')
          .eq('parent_id', courseId),
        supabase
          .from('course_lesson_watch_progress')
          .select(
            'lesson_id, watched_seconds, duration_seconds, watched_percent, completed_at, last_watched_at',
          )
          .eq('user_id', user.id)
          .eq('course_id', courseId),
      ])

      if (completedRes.error) throw completedRes.error
      if (watchRes.error) throw watchRes.error

      const completedLessons = (completedRes.data ?? []).map(
        d => d.content_id as string,
      )

      const lessonProgress: Record<string, CourseLessonProgress> = {}
      for (const row of watchRes.data ?? []) {
        lessonProgress[row.lesson_id as string] = {
          lessonId: row.lesson_id as string,
          watchedSeconds: Number(row.watched_seconds ?? 0),
          durationSeconds: Number(row.duration_seconds ?? 0),
          watchedPercent: Number(row.watched_percent ?? 0),
          completedAt: (row.completed_at as string) ?? null,
          lastWatchedAt: (row.last_watched_at as string) ?? null,
        }
      }

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
        lessonProgress,
        totalLessons: safeTotal,
        courseProgress: progress,
        isComplete: safeTotal > 0 && completedLessons.length >= safeTotal,
      }
    },
  })

  return {
    ...(query.data ?? EMPTY),
    isLoading: query.isLoading,
    refetch: query.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: courseProgressKey(courseId, user?.id),
      }),
  }
}
