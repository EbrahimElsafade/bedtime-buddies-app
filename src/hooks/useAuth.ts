
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to handle auth operations with retry logic
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Auth operation attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await withRetry(() => 
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );

      if (error) {
        throw error;
      }

      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
        console.log("Login successful, session established");
      }
      
      toast.success('Logged in successfully');
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
      // Sign up the user with retry logic
      const { data, error } = await withRetry(() =>
        supabase.auth.signUp({
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
        })
      );
      
      if (error) {
        throw error;
      }
      
      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
        console.log("Registration successful, session established");
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
      const { error } = await withRetry(() => supabase.auth.signOut());
      if (error) {
        throw error;
      }
      
      // Clear user and session state
      setUser(null);
      setSession(null);
      console.log("Logout successful, session cleared");
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await withRetry(() =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
      );
      
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
