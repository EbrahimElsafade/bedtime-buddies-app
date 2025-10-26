
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { logger } from '@/utils/logger';

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async (userId: string, skipIfLoaded = false) => {
    let isCancelled = false;

    // Skip fetching if profile is already loaded and skipIfLoaded is true
    if (skipIfLoaded && profileLoaded && profile) {
      return profile;
    }

    try {
      if (!isCancelled) {
        setIsLoading(true);
        setError(null);
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        logger.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (isCancelled) {
        return profile;
      }

      // Transform the data to match the Profile type
      const transformedProfile: Profile = {
        id: profileData.id,
        parent_name: profileData.parent_name,
        child_name: profileData.child_name,
        preferred_language: profileData.preferred_language as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr',
        is_premium: profileData.is_premium,
        subscription_tier: profileData.subscription_tier,
        subscription_end: profileData.subscription_end,
        profile_image: profileData.profile_image,
        linked_accounts: (profileData.linked_accounts || []) as Profile['linked_accounts'],
        skills: profileData.skills,
      };
      
      if (!isCancelled) {
        setProfile(transformedProfile);
        setProfileLoaded(true);
      }
      
      return transformedProfile;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error("Error in fetchUserProfile:", error);
      setError(error);
      setProfile(null);
      setProfileLoaded(true); // Still set to true to prevent infinite loading
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profile, profileLoaded]);

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Transform the data to match the Profile type from auth.ts
      const transformedProfile: Profile = {
        id: data.id,
        parent_name: data.parent_name,
        child_name: data.child_name,
        preferred_language: data.preferred_language as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr',
        is_premium: data.is_premium,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        profile_image: data.profile_image,
        linked_accounts: (data.linked_accounts || []) as Profile['linked_accounts'],
        skills: data.skills,
      };

      setProfile(transformedProfile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch profile when user changes
  useEffect(() => {
    let mounted = true;
    
    const initializeProfile = async () => {
      if (user?.id && !profileLoaded) {
        try {
          await fetchUserProfile(user.id);
        } catch (error) {
          if (mounted) {
            logger.error("Error in profile initialization:", error);
          }
        }
      } else if (!user && mounted) {
        // Clear profile when user logs out
        setProfile(null);
        setProfileLoaded(false);
        setError(null);
      }
    };

    initializeProfile();

    return () => {
      mounted = false;
    };
  }, [user, fetchUserProfile, profileLoaded]);

  return {
    profile,
    isLoading,
    profileLoaded,
    error,
    fetchUserProfile,
    updateProfile,
    setProfile,
  };
};
