import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface ContentProgress {
  id: string
  user_id: string
  content_type: 'story' | 'course'
  content_id: string
  completed_at: string
  created_at: string
}

interface CompletedContent {
  stories: ContentProgress[]
  courses: ContentProgress[]
}

export const useContentProgress = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: completedContent, isLoading } = useQuery({
    queryKey: ['user-content-progress', user?.id],
    queryFn: async (): Promise<CompletedContent> => {
      if (!user?.id) return { stories: [], courses: [] }

      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) throw error

      const stories = (data || []).filter(item => item.content_type === 'story') as ContentProgress[]
      const courses = (data || []).filter(item => item.content_type === 'course') as ContentProgress[]

      return { stories, courses }
    },
    enabled: !!user?.id,
  })

  const markAsCompleted = useMutation({
    mutationFn: async ({ contentType, contentId }: { contentType: 'story' | 'course'; contentId: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_content_progress')
        .upsert(
          {
            user_id: user.id,
            content_type: contentType,
            content_id: contentId,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,content_type,content_id',
          }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-content-progress'] })
    },
  })

  const removeCompletion = useMutation({
    mutationFn: async ({ contentType, contentId }: { contentType: 'story' | 'course'; contentId: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_content_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-content-progress'] })
    },
  })

  const isCompleted = (contentType: 'story' | 'course', contentId: string): boolean => {
    if (!completedContent) return false
    const list = contentType === 'story' ? completedContent.stories : completedContent.courses
    return list.some(item => item.content_id === contentId)
  }

  const totalPoints = (completedContent?.stories?.length || 0) + (completedContent?.courses?.length || 0)

  return {
    completedContent,
    isLoading,
    markAsCompleted,
    removeCompletion,
    isCompleted,
    totalPoints,
    completedStoriesCount: completedContent?.stories?.length || 0,
    completedCoursesCount: completedContent?.courses?.length || 0,
  }
}
