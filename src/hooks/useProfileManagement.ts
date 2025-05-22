
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/auth';

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.error("Cannot fetch profile: User ID is undefined");
      setIsLoading(false);
      setProfileLoaded(true);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching profile for user:", userId);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data as Profile);
      } else {
        console.log("No profile found for user:", userId);
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error.message);
      setError(error);
      setProfile(null);
    } finally {
      setIsLoading(false);
      setProfileLoaded(true);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      if (data) {
        setProfile(data as Profile);
      }
      
      return data as Profile;
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch profile whenever user changes
  useEffect(() => {
    console.log("useProfileManagement - User changed:", user?.id);
    // Reset state when user changes
    setProfileLoaded(false);
    
    // Only fetch profile if user exists
    if (user?.id) {
      fetchUserProfile(user.id);
    } else {
      setProfile(null);
      setIsLoading(false);
      setProfileLoaded(true);
    }
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    fetchUserProfile,
    updateProfile,
    setProfile,
    profileLoaded
  };
};
