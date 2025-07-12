
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  parent_name: string;
  child_name: string | null;
  preferred_language: string;
  is_premium: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async (userId: string, skipIfLoaded = false) => {
    // Skip fetching if profile is already loaded and skipIfLoaded is true
    if (skipIfLoaded && profileLoaded && profile) {
      console.log("Profile already loaded, skipping fetch");
      return profile;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Starting to fetch profile for user:", userId);
      console.log("Querying profiles table for user:", userId);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      console.log("Profile fetched successfully:", data);
      setProfile(data);
      setProfileLoaded(true);
      console.log("Profile fetch completed, profileLoaded set to true");
      
      return data;
    } catch (err: any) {
      console.error("Error in fetchUserProfile:", err);
      setError(err);
      setProfile(null);
      setProfileLoaded(true); // Still set to true to prevent infinite loading
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile, profileLoaded]);

  const updateProfile = async (updates: Partial<Profile>) => {
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

      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch profile when user changes, but avoid refetch on tab switches
  useEffect(() => {
    if (user?.id) {
      console.log("useProfileManagement effect triggered, user:", user.id);
      
      // Only fetch if we don't have a profile loaded yet
      if (!profileLoaded) {
        fetchUserProfile(user.id);
      } else {
        console.log("Profile already loaded, skipping fetch");
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
