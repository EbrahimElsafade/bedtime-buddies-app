import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'
import { UserRole } from '@/types/auth'

export const useRoleManagement = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkIsAdmin = useCallback(async () => {
    if (!user?.id) {
      setIsAdmin(false)
      setIsLoading(false)
      return
    }

    try {
      logger.debug('Checking admin status for user:', user.id)

      // Use the simpler is_admin() RPC function
      const { data, error } = await supabase.rpc('is_admin')

      if (error) {
        logger.error('Error checking admin status:', error)
        setIsAdmin(false)
        return
      }

      logger.debug('Admin status result:', data)
      setIsAdmin(!!data)
    } catch (err) {
      logger.error('Error in checkIsAdmin:', err)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const checkHasRole = useCallback(async (userId: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: role,
      })

      if (error) {
        logger.error('Error checking role:', error)
        return false
      }

      return data
    } catch (err) {
      logger.error('Error in checkHasRole:', err)
      return false
    }
  }, [])

  useEffect(() => {
    checkIsAdmin()
  }, [checkIsAdmin])

  return {
    isAdmin,
    isLoading,
    checkHasRole,
  }
}