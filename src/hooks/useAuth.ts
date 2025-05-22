import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast.error(error.message || 'Failed to sign in');
      throw error;
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
      const { data, error } = await supabase.auth.signUp({
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
      
      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear user and session state
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Logout error:', error.message);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
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

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    resetPassword
  };
};
