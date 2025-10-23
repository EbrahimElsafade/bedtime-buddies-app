import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'
import { UserRole } from '@/types/auth'

export const useRoleManagement = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkIsAdmin = useCallback(async () => {
    setIsLoading(true)
    
    if (!user?.id) {
      setIsAdmin(false)
      setIsLoading(false)
      return
    }

    try {
      logger.debug('Checking admin status for user:', user.id)

      // First try direct role check
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (roleError) {
        logger.error('Error checking admin role:', roleError)
        // Fallback to RPC if direct check fails
        const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin')
        
        if (rpcError) {
          logger.error('Error in is_admin RPC:', rpcError)
          setIsAdmin(false)
          return
        }
        
        setIsAdmin(!!rpcData)
        return
      }

      setIsAdmin(!!roleData)
      logger.debug('Admin status result:', !!roleData)
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