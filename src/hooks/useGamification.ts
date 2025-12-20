import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { logger } from '@/utils/logger'

export interface GamificationStats {
  totalPoints: number
  unlockedMilestones: number[]
  milestoneThresholds: number[]
}

export interface FinishedContent {
  id: string
  content_type: 'story' | 'course'
  content_id: string
  finished_at: string
}

export interface FinishedStory {
  id: string
  content_id: string
  finished_at: string
  story: {
    id: string
    title: Record<string, string>
    description: Record<string, string>
    cover_image: string | null
    category: string
  } | null
}

export interface FinishedCourse {
  id: string
  content_id: string
  finished_at: string
  course: {
    id: string
    title_en: string
    title_ar: string | null
    title_fr: string | null
    description_en: string
    description_ar: string | null
    description_fr: string | null
    cover_image: string | null
    category: string
  } | null
}

export const useGamification = () => {
  const { user, isAuthenticated } = useAuth()
  const { t } = useTranslation(['common'])
  const [stats, setStats] = useState<GamificationStats>({
    totalPoints: 0,
    unlockedMilestones: [],
    milestoneThresholds: [5, 10, 25, 50, 100],
  })
  const [finishedStories, setFinishedStories] = useState<FinishedStory[]>([])
  const [finishedCourses, setFinishedCourses] = useState<FinishedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_user_gamification_stats', {
        _user_id: user.id,
      })

      if (error) throw error

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const statsData = data as Record<string, unknown>
        setStats({
          totalPoints: (statsData.total_points as number) || 0,
          unlockedMilestones: (statsData.unlocked_milestones as number[]) || [],
          milestoneThresholds: (statsData.milestone_thresholds as number[]) || [5, 10, 25, 50, 100],
        })
      }
    } catch (error) {
      logger.error('Error fetching gamification stats:', error)
    }
  }, [user])

  const fetchFinishedContent = useCallback(async () => {
    if (!user) return

    try {
      // Fetch finished stories
      const { data: storyData, error: storyError } = await supabase
        .from('user_finished_content')
        .select('id, content_id, finished_at')
        .eq('user_id', user.id)
        .eq('content_type', 'story')
        .order('finished_at', { ascending: false })

      if (storyError) throw storyError

      // Fetch story details for each finished story
      if (storyData && storyData.length > 0) {
        const storyIds = storyData.map(s => s.content_id)
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('id, title, description, cover_image, category')
          .in('id', storyIds)

        if (storiesError) throw storiesError

        const finishedWithDetails: FinishedStory[] = storyData.map(f => {
          const storyData = stories?.find(s => s.id === f.content_id)
          return {
            id: f.id,
            content_id: f.content_id,
            finished_at: f.finished_at,
            story: storyData ? {
              id: storyData.id,
              title: (storyData.title as Record<string, string>) || {},
              description: (storyData.description as Record<string, string>) || {},
              cover_image: storyData.cover_image,
              category: storyData.category,
            } : null,
          }
        })

        setFinishedStories(finishedWithDetails)
      } else {
        setFinishedStories([])
      }

      // Fetch finished courses
      const { data: courseData, error: courseError } = await supabase
        .from('user_finished_content')
        .select('id, content_id, finished_at')
        .eq('user_id', user.id)
        .eq('content_type', 'course')
        .order('finished_at', { ascending: false })

      if (courseError) throw courseError

      // Fetch course details for each finished course
      if (courseData && courseData.length > 0) {
        const courseIds = courseData.map(c => c.content_id)
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title_en, title_ar, title_fr, description_en, description_ar, description_fr, cover_image, category')
          .in('id', courseIds)

        if (coursesError) throw coursesError

        const finishedWithDetails: FinishedCourse[] = courseData.map(f => ({
          id: f.id,
          content_id: f.content_id,
          finished_at: f.finished_at,
          course: courses?.find(c => c.id === f.content_id) || null,
        }))

        setFinishedCourses(finishedWithDetails)
      } else {
        setFinishedCourses([])
      }
    } catch (error) {
      logger.error('Error fetching finished content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const recordProgress = useCallback(
    async (
      contentType: 'story_section' | 'course_lesson',
      contentId: string,
      parentId: string
    ) => {
      if (!user) return null

      try {
        const { data, error } = await supabase.rpc('record_content_progress', {
          _user_id: user.id,
          _content_type: contentType,
          _content_id: contentId,
          _parent_id: parentId,
        })

        if (error) throw error

        const result = data as Record<string, unknown> | null
        if (result?.newly_completed) {
          // Refresh stats
          await fetchStats()
          await fetchFinishedContent()
          
          // Show celebration toast
          const contentName = contentType === 'story_section' ? t('story') : t('course')
          toast.success(t('contentCompleted', { content: contentName }), {
            description: t('pointEarned'),
          })
        }

        return result
      } catch (error) {
        logger.error('Error recording progress:', error)
        return null
      }
    },
    [user, fetchStats, fetchFinishedContent, t]
  )

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(true)
      Promise.all([fetchStats(), fetchFinishedContent()]).finally(() =>
        setIsLoading(false)
      )
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, fetchStats, fetchFinishedContent])

  return {
    stats,
    finishedStories,
    finishedCourses,
    isLoading,
    recordProgress,
    refreshStats: fetchStats,
    refreshFinishedContent: fetchFinishedContent,
  }
}
