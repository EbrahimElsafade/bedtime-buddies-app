import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Permission } from '@/types/auth';
import { logger } from '@/utils/logger';
import { hasPermission, hasAnyPermission } from '@/utils/permissions';

export const useUserRole = (user: User | null) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setRole(null);
        setRoles([]);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          logger.error("Error fetching user roles:", error);
          setRole('user');
          setRoles(['user']);
          return;
        }

        const userRoles = data.map(r => r.role as UserRole);
        
        // Set primary role: admin > editor > premium > user
        const primaryRole = 
          userRoles.includes('admin') ? 'admin' :
          userRoles.includes('editor') ? 'editor' :
          userRoles.includes('premium') ? 'premium' : 'user';
        
        setRole(primaryRole);
        setRoles(userRoles.length > 0 ? userRoles : ['user']);
      } catch (err) {
        logger.error("Error in fetchUserRoles:", err);
        setRole('user');
        setRoles(['user']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || isAdmin;
  const isPremium = role === 'premium' || isEditor;
  const canAccessAdmin = role === 'admin';
  const canEditContent = role === 'editor' || role === 'admin';

  const checkPermission = (permission: Permission) => hasPermission(role, permission);
  const checkAnyPermission = (permissions: Permission[]) => hasAnyPermission(role, permissions);

  return {
    role,
    roles,
    isAdmin,
    isEditor,
    isPremium,
    canAccessAdmin,
    canEditContent,
    checkPermission,
    checkAnyPermission,
    isLoading
  };
};
