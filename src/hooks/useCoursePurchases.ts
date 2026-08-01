import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/utils/logger'

/** Course IDs the signed-in user permanently owns. */
export const useMyPurchasedCourseIds = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['course-purchases', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('course_purchases')
        .select('course_id')
        .eq('user_id', user!.id)

      if (error) {
        logger.error('Error fetching course purchases:', error)
        throw error
      }
      return (data || []).map(row => row.course_id)
    },
  })
}

/** Admin helper: course IDs owned by an arbitrary user. */
export const useUserPurchasedCourseIds = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['course-purchases', 'admin', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('course_purchases')
        .select('course_id')
        .eq('user_id', userId!)

      if (error) throw error
      return (data || []).map(row => row.course_id)
    },
  })
}

/** Admin helper: apply a new set of owned courses for a user (diff based). */
export const useSyncUserCoursePurchases = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return async (
    targetUserId: string,
    nextCourseIds: string[],
    currentCourseIds: string[],
  ) => {
    const toAdd = nextCourseIds.filter(id => !currentCourseIds.includes(id))
    const toRemove = currentCourseIds.filter(id => !nextCourseIds.includes(id))

    if (toAdd.length) {
      const { error } = await supabase.from('course_purchases').insert(
        toAdd.map(courseId => ({
          user_id: targetUserId,
          course_id: courseId,
          granted_by: user?.id ?? null,
          source: 'admin_grant',
        })),
      )
      if (error) throw error
    }

    if (toRemove.length) {
      const { error } = await supabase
        .from('course_purchases')
        .delete()
        .eq('user_id', targetUserId)
        .in('course_id', toRemove)
      if (error) throw error
    }

    await queryClient.invalidateQueries({ queryKey: ['course-purchases'] })
  }
}
