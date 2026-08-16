import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  courseProgressKey,
  type CourseProgress,
} from '@/hooks/useCourseProgress'

/** Authoritative result returned by `record_course_lesson_watch_progress`. */
export interface LessonProgressResult {
  completed: boolean
  lesson_newly_completed: boolean
  watched_percent: number
  completed_lessons: number
  total_lessons: number
  course_progress: number
  course_complete: boolean
  course_newly_completed: boolean
  points_awarded: boolean
  completion_id: string | null
  completed_at: string | null
}

interface RecordArgs {
  lessonId: string
  watchedSeconds: number
  durationSeconds: number
  explicitComplete?: boolean
  completionThreshold?: number
}

/**
 * Single service used by BOTH the manual "mark as completed" button and the
 * automatic watch heartbeat. The database transaction is authoritative and
 * idempotent, so its returned summary is written straight into the cache
 * before any refetch happens.
 */
export const useLessonCompletion = (courseId: string | undefined) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null)
  const inFlight = useRef<Record<string, boolean>>({})

  const applyResult = useCallback(
    (lessonId: string, result: LessonProgressResult) => {
      const key = courseProgressKey(courseId, user?.id)
      queryClient.setQueryData<CourseProgress>(key, prev => {
        if (!prev) return prev
        const completedLessons = result.completed
          ? Array.from(new Set([...prev.completedLessons, lessonId]))
          : prev.completedLessons.filter(id => id !== lessonId)
        return {
          ...prev,
          completedLessons,
          totalLessons: result.total_lessons || prev.totalLessons,
          courseProgress: result.course_progress,
          isComplete: result.course_complete,
          isCompletionPersisted: result.course_complete,
          completionId: result.completion_id ?? prev.completionId,
          completionDate: result.completed_at ?? prev.completionDate,
          lessonProgress: {
            ...prev.lessonProgress,
            [lessonId]: {
              lessonId,
              watchedSeconds: Math.max(
                prev.lessonProgress[lessonId]?.watchedSeconds ?? 0,
                0,
              ),
              durationSeconds:
                prev.lessonProgress[lessonId]?.durationSeconds ?? 0,
              watchedPercent: Math.max(
                prev.lessonProgress[lessonId]?.watchedPercent ?? 0,
                Number(result.watched_percent ?? 0),
              ),
              completedAt: result.completed
                ? (prev.lessonProgress[lessonId]?.completedAt ??
                  new Date().toISOString())
                : null,
              lastWatchedAt: new Date().toISOString(),
            },
          },
        }
      })

      // Refresh every consumer of course progress / finished content.
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      queryClient.invalidateQueries({ queryKey: ['courses-progress'] })
      queryClient.invalidateQueries({ queryKey: ['finished-content'] })
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] })
      queryClient.invalidateQueries({ queryKey: ['course-purchases'] })
    },
    [courseId, queryClient, user?.id],
  )

  const recordProgress = useCallback(
    async ({
      lessonId,
      watchedSeconds,
      durationSeconds,
      explicitComplete = false,
      completionThreshold = 95,
    }: RecordArgs): Promise<LessonProgressResult | null> => {
      if (!courseId || !user || inFlight.current[lessonId]) return null
      inFlight.current[lessonId] = true
      if (explicitComplete) setPendingLessonId(lessonId)
      try {
        const { data, error } = await supabase.rpc(
          'record_course_lesson_watch_progress',
          {
            _user_id: user.id,
            _course_id: courseId,
            _lesson_id: lessonId,
            _watched_seconds: Math.max(Math.round(watchedSeconds), 0),
            _duration_seconds: Math.max(Math.round(durationSeconds), 0),
            _explicit_complete: explicitComplete,
            _completion_threshold: completionThreshold,
          },
        )
        if (error) throw error
        const result = data as unknown as LessonProgressResult
        applyResult(lessonId, result)
        return result
      } finally {
        inFlight.current[lessonId] = false
        if (explicitComplete) setPendingLessonId(null)
      }
    },
    [applyResult, courseId, user],
  )

  return { recordProgress, pendingLessonId }
}
