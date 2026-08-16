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
  /** Persisted `user_finished_content` row — the only certificate gate. */
  isCompletionPersisted: boolean
  completionId: string | null
  completionDate: string | null
}

const EMPTY: CourseProgress = {
  completedLessons: [],
  lessonProgress: {},
  totalLessons: 0,
  courseProgress: 0,
  isComplete: false,
  isCompletionPersisted: false,
  completionId: null,
  completionDate: null,
}

export const courseProgressKey = (courseId?: string, userId?: string) =>
  ['course-progress', courseId, userId] as const

export const coursesProgressKey = (courseIds: string[], userId?: string) =>
  ['courses-progress', [...courseIds].sort().join(','), userId] as const

/** Percentage helper shared by the single and batched variants. */
const pct = (completed: number, total: number) =>
  total <= 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))

/**
 * Accurate course progress:
 *  - Total lessons = COUNT(course_lessons.id) for the course (source of truth).
 *  - Completed lessons = rows in `user_section_progress` for this user+course,
 *    intersected with the lessons that still exist in the course. Stale rows
 *    (lessons deleted or moved) can never inflate the percentage.
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

      // Lesson IDs are the source of truth for both the total and the filter.
      const { data: lessonRows, error: lessonError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId)

      if (lessonError) throw lessonError
      const lessonIds = new Set((lessonRows ?? []).map(r => r.id as string))
      const totalLessons = lessonIds.size

      if (!user || !isAuthenticated) {
        return { ...EMPTY, totalLessons }
      }

      const [completedRes, watchRes, finishedRes] = await Promise.all([
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
        supabase
          .from('user_finished_content')
          .select('id, finished_at')
          .eq('user_id', user.id)
          .eq('content_type', 'course')
          .eq('content_id', courseId)
          .maybeSingle(),
      ])

      if (completedRes.error) throw completedRes.error
      if (watchRes.error) throw watchRes.error
      if (finishedRes.error) throw finishedRes.error

      const completedLessons = Array.from(
        new Set(
          (completedRes.data ?? [])
            .map(d => d.content_id as string)
            .filter(id => lessonIds.has(id)),
        ),
      )

      const lessonProgress: Record<string, CourseLessonProgress> = {}
      for (const row of watchRes.data ?? []) {
        const lessonId = row.lesson_id as string
        if (!lessonIds.has(lessonId)) continue
        lessonProgress[lessonId] = {
          lessonId,
          watchedSeconds: Number(row.watched_seconds ?? 0),
          durationSeconds: Number(row.duration_seconds ?? 0),
          watchedPercent: Number(row.watched_percent ?? 0),
          completedAt: (row.completed_at as string) ?? null,
          lastWatchedAt: (row.last_watched_at as string) ?? null,
        }
      }

      return {
        completedLessons,
        lessonProgress,
        totalLessons,
        courseProgress: pct(completedLessons.length, totalLessons),
        isComplete:
          totalLessons > 0 && completedLessons.length >= totalLessons,
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

export interface CourseProgressSummary {
  completed: number
  total: number
  percent: number
  isComplete: boolean
}

/**
 * Batched progress for a list of courses (course lists, purchased courses).
 * Uses the exact same rules as `useCourseProgress`, so numbers always match.
 */
export const useCoursesProgress = (courseIds: string[]) => {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: coursesProgressKey(courseIds, user?.id),
    enabled: courseIds.length > 0,
    queryFn: async (): Promise<Record<string, CourseProgressSummary>> => {
      const { data: lessonRows, error: lessonError } = await supabase
        .from('course_lessons')
        .select('id, course_id')
        .in('course_id', courseIds)

      if (lessonError) throw lessonError

      const lessonsByCourse = new Map<string, Set<string>>()
      for (const row of lessonRows ?? []) {
        const courseId = row.course_id as string
        if (!lessonsByCourse.has(courseId)) lessonsByCourse.set(courseId, new Set())
        lessonsByCourse.get(courseId)!.add(row.id as string)
      }

      const completedByCourse = new Map<string, Set<string>>()
      if (user && isAuthenticated) {
        const { data, error } = await supabase
          .from('user_section_progress')
          .select('content_id, parent_id')
          .eq('user_id', user.id)
          .eq('content_type', 'course_lesson')
          .in('parent_id', courseIds)

        if (error) throw error
        for (const row of data ?? []) {
          const courseId = row.parent_id as string
          const lessonId = row.content_id as string
          if (!lessonsByCourse.get(courseId)?.has(lessonId)) continue
          if (!completedByCourse.has(courseId))
            completedByCourse.set(courseId, new Set())
          completedByCourse.get(courseId)!.add(lessonId)
        }
      }

      const result: Record<string, CourseProgressSummary> = {}
      for (const courseId of courseIds) {
        const total = lessonsByCourse.get(courseId)?.size ?? 0
        const completed = completedByCourse.get(courseId)?.size ?? 0
        result[courseId] = {
          completed,
          total,
          percent: pct(completed, total),
          isComplete: total > 0 && completed >= total,
        }
      }
      return result
    },
  })
}
