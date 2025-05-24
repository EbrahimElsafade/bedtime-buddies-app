
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/types/auth';

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    console.log("Starting to fetch profile for user:", userId);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Querying profiles table for user:", userId);
      
      // Query the profiles table for the user's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // If the profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log("No profile found, creating default profile");
          await createDefaultProfile(userId);
          return;
        }
        
        setError(error);
        toast.error('Failed to load profile data');
        return;
      }
      
      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data as Profile);
      } else {
        console.warn("No profile data returned for user:", userId);
        // Create default profile if none found
        await createDefaultProfile(userId);
      }
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
      setProfileLoaded(true);
      console.log("Profile fetch completed, profileLoaded set to true");
    }
  };

  // Create a default profile for a user if one doesn't exist
  const createDefaultProfile = async (userId: string) => {
    try {
      console.log("Creating default profile for user:", userId);
      
      const defaultProfile: Profile = {
        id: userId,
        parent_name: user?.email || 'User',
        preferred_language: 'ar-eg',
        is_premium: false,
        role: 'user'
      };
      
      console.log("Inserting default profile:", defaultProfile);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating default profile:', error);
        setError(error);
        toast.error('Failed to create profile');
        return;
      }
      
      console.log("Default profile created successfully:", data);
      setProfile(data as Profile);
      toast.success('Profile created successfully');
    } catch (error: any) {
      console.error('Error creating default profile:', error);
      setError(error);
    }
  };

  // Load profile whenever user changes
  useEffect(() => {
    console.log("useProfileManagement effect triggered, user:", user?.id);
    
    if (user) {
      setProfileLoaded(false); // Reset loading state when starting fresh
      setProfile(null); // Clear any existing profile data
      fetchUserProfile(user.id);
    } else {
      console.log("No user, clearing profile state");
      setProfile(null);
      setProfileLoaded(false); // Important: Don't mark as loaded when no user
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  // Update profile function
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      console.error("Cannot update profile: No user authenticated");
      throw new Error("No user authenticated");
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
      await fetchUserProfile(user.id);
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
    isLoading,
    error
  };
};
