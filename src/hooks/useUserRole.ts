import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { logger } from '@/utils/logger';

export const useUserRole = (user: User | null) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setRole(null);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          logger.error("Error fetching user role:", error);
          setRole('user'); // Default to user role
          return;
        }

        setRole(data.role as UserRole);
      } catch (err) {
        logger.error("Error in fetchUserRole:", err);
        setRole('user'); // Default to user role
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';

  return {
    role,
    isAdmin,
    isModerator,
    isLoading
  };
};
