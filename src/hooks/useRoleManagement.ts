import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'
import { UserRole, Permission } from '@/types/auth'
import { hasPermission } from '@/utils/permissions'

export const useRoleManagement = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditor, setIsEditor] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkRoles = useCallback(async () => {
    setIsLoading(true)
    
    if (!user?.id) {
      setIsAdmin(false)
      setIsEditor(false)
      setIsPremium(false)
      setPrimaryRole(null)
      setIsLoading(false)
      return
    }

    try {
      logger.debug('Checking roles for user:', user.id)

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (roleError) {
        logger.error('Error checking roles:', roleError)
        setIsAdmin(false)
        setIsEditor(false)
        setIsPremium(false)
        setPrimaryRole('user')
        return
      }

      const roles = roleData?.map(r => r.role as UserRole) ?? []
      
      const admin = roles.includes('admin')
      const editor = roles.includes('editor')
      const premium = roles.includes('premium')
      
      setIsAdmin(admin)
      setIsEditor(editor || admin)
      setIsPremium(premium || editor || admin)
      
      // Set primary role: admin > editor > premium > user
      const primary = 
        admin ? 'admin' :
        editor ? 'editor' :
        premium ? 'premium' : 'user'
      setPrimaryRole(primary)
      
      logger.debug('Roles result:', { admin, editor, premium, primary })
    } catch (err) {
      logger.error('Error in checkRoles:', err)
      setIsAdmin(false)
      setIsEditor(false)
      setIsPremium(false)
      setPrimaryRole('user')
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

  const checkPermission = useCallback((permission: Permission) => {
    return hasPermission(primaryRole, permission)
  }, [primaryRole])

  useEffect(() => {
    checkRoles()
  }, [checkRoles])

  return {
    isAdmin,
    isEditor,
    isPremium,
    primaryRole,
    isLoading,
    checkHasRole,
    checkPermission,
  }
}