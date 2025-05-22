
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Profile = {
  id: string;
  parent_name: string;
  child_name?: string;
  preferred_language: 'en' | 'ar-eg' | 'ar-fos7a';
  is_premium: boolean;
  subscription_tier?: string;
  subscription_end?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (email: string, password: string, parentName: string, childName?: string, preferredLanguage?: 'en' | 'ar-eg' | 'ar-fos7a') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        // For debugging
        console.log('Auth state changed:', event, currentSession?.user?.email);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Auth state listener will handle setting the user
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google login error:', error.message);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Apple login error:', error.message);
      toast.error(error.message || 'Failed to sign in with Apple');
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    parentName: string, 
    childName?: string, 
    preferredLanguage: 'en' | 'ar-eg' | 'ar-fos7a' = 'ar-eg'
  ) => {
    setIsLoading(true);
    try {
      // Sign up the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            parent_name: parentName,
            child_name: childName,
            preferred_language: preferredLanguage,
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Registration error:', error.message);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Auth state change will handle clearing the user
    } catch (error: any) {
      console.error('Logout error:', error.message);
      toast.error('Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Password reset error:', error.message);
      toast.error(error.message || 'Failed to send reset password instructions');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local profile state
      setProfile({ ...profile, ...data });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error.message);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
