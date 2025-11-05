
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
    // Skip fetching if profile is already loaded and skipIfLoaded is true
    if (skipIfLoaded && profileLoaded && profile) {
      // logger.debug("Profile already loaded, skipping fetch");
      return profile;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // logger.debug("Starting to fetch profile for user:", userId);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        logger.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!data) {
        logger.warn("No profile found for user:", userId);
        setProfile(null);
        setProfileLoaded(true);
        return null;
      }

      // logger.debug("Profile fetched successfully:", data);
      
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
      setProfileLoaded(true);
      // logger.debug("Profile fetch completed, profileLoaded set to true");
      
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

  // Effect to fetch profile when user changes, but avoid refetch on tab switches
  useEffect(() => {
    if (user?.id) {
      // logger.debug("useProfileManagement effect triggered, user:", user.id);
      
      // Only fetch if we don't have a profile loaded yet
      if (!profileLoaded) {
        fetchUserProfile(user.id);
      } else {
        // logger.debug("Profile already loaded, skipping fetch");
      }
    } else if (!user) {
      // Clear profile when user logs out
      setProfile(null);
      setProfileLoaded(false);
      setError(null);
    }
  }, [user?.id, fetchUserProfile, profileLoaded]);

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
