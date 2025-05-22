
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/types/auth';

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setProfileLoaded(true);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data as Profile);
      } else {
        console.warn("No profile found for user:", userId);
        toast.error('No profile data found for your account');
      }
      setProfileLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileLoaded(true);
      setIsLoading(false);
    }
  };

  // Load profile whenever user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setProfile(null);
      setProfileLoaded(true);
      setIsLoading(false);
    }
  }, [user]);

  // Update profile function
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      console.error("Cannot update profile: No user authenticated");
      return;
    }
    
    try {
      console.log("Updating profile for user:", user.id, data);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully');
      
      // Refresh profile data to ensure we have the latest
      fetchUserProfile(user.id);
    } catch (error: any) {
      console.error('Profile update error:', error.message);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return {
    profile,
    profileLoaded,
    fetchUserProfile,
    updateProfile,
    setProfile,
    isLoading
  };
};
