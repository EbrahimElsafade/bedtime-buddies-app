
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AuthContextType } from '@/types/auth';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

// Create the context with a default value to prevent undefined context errors
const defaultContextValue: AuthContextType = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isProfileLoaded: false,
  login: async () => { throw new Error('AuthProvider not initialized') },
  loginWithGoogle: async () => { throw new Error('AuthProvider not initialized') },
  loginWithFacebook: async () => { throw new Error('AuthProvider not initialized') },
  linkSocialAccount: async () => { throw new Error('AuthProvider not initialized') },
  unlinkSocialAccount: async () => { throw new Error('AuthProvider not initialized') },
  register: async () => { throw new Error('AuthProvider not initialized') },
  logout: async () => { throw new Error('AuthProvider not initialized') },
  resetPassword: async () => { throw new Error('AuthProvider not initialized') },
  updateProfile: async () => { throw new Error('AuthProvider not initialized') }
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Debounce function to prevent rapid auth state changes
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Auth operations
  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
        logger.info("Login successful, session established");
      }
      
      toast.success('Logged in successfully');
    } catch (error: any) {
      logger.error('Login error:', error.message);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setAuthLoading(false);
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
      
      if (error) throw error;
    } catch (error: any) {
      logger.error('Google login error:', error.message);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      logger.error('Facebook login error:', error.message);
      toast.error(error.message || 'Failed to sign in with Facebook');
      throw error;
    }
  };

  const linkSocialAccount = async (provider: 'facebook' | 'google') => {
    try {
      if (!user) throw new Error('Must be logged in to link accounts');
      
      const { error } = await supabase.auth.linkIdentity({
        provider: provider as any,
      });
      
      if (error) throw error;
      
      toast.success(`${provider} account linking initiated`);
    } catch (error: any) {
      logger.error('Link account error:', error.message);
      toast.error(error.message || 'Failed to link account');
      throw error;
    }
  };

  const unlinkSocialAccount = async (provider: 'facebook' | 'google') => {
    try {
      if (!user) throw new Error('Must be logged in to unlink accounts');
      
      const identity = user.identities?.find(id => id.provider === provider);
      if (!identity) {
        throw new Error('Account not linked');
      }
      
      const { error } = await supabase.auth.unlinkIdentity(identity);
      
      if (error) throw error;
      
      // Update profile to remove from linked_accounts
      const updatedAccounts = (profile?.linked_accounts || []).filter(acc => acc !== provider);
      await updateProfile({ linked_accounts: updatedAccounts });
      
      toast.success(`${provider} account unlinked successfully`);
    } catch (error: any) {
      logger.error('Unlink account error:', error.message);
      toast.error(error.message || 'Failed to unlink account');
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    parentName: string, 
    childName?: string, 
    preferredLanguage: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr' = 'ar-fos7a'
  ) => {
    setAuthLoading(true);
    try {
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
      
      if (error) throw error;
      
      if (data && data.user) {
        setUser(data.user);
        setSession(data.session);
        logger.info("Registration successful, session established");
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      logger.error('Registration error:', error.message);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      logger.info("Logout successful, session cleared");
      toast.success('Logged out successfully');
    } catch (error: any) {
      logger.error('Logout error:', error.message);
      toast.error('Failed to sign out');
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      logger.error('Password reset error:', error.message);
      toast.error(error.message || 'Failed to send reset password instructions');
      throw error;
    }
  };

  const {
    profile,
    profileLoaded,
    fetchUserProfile,
    updateProfile,
    setProfile,
    isLoading: profileLoading,
    error: profileError
  } = useProfileManagement(user);

  // More accurate loading state calculation
  const isLoading = authLoading || (!!user && !profileLoaded);

  // Simplified auth state handler without complex ref management
  const handleAuthStateChange = useCallback(
    debounce(async (event: string, currentSession: any) => {
      // logger.debug('Processing auth state change:', event, currentSession?.user?.email);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Update linked accounts based on actual identities
        if (currentSession.user?.identities) {
          const providers = currentSession.user.identities.map((id: any) => id.provider);
          // Defer the profile update to avoid race conditions
          setTimeout(async () => {
            try {
              const { data: currentProfile } = await supabase
                .from('profiles')
                .select('linked_accounts')
                .eq('id', currentSession.user.id)
                .single();
              
              const existingAccounts = currentProfile?.linked_accounts || [];
              const hasChanges = providers.some((p: string) => !existingAccounts.includes(p)) ||
                                 existingAccounts.some((a: string) => !providers.includes(a));
              
              if (hasChanges) {
                await supabase
                  .from('profiles')
                  .update({ linked_accounts: providers })
                  .eq('id', currentSession.user.id);
              }
            } catch (error) {
              logger.warn('Failed to sync linked accounts:', error);
            }
          }, 0);
        }
        
        // Store session in sessionStorage as backup
        try {
          sessionStorage.setItem('supabase.auth.session', JSON.stringify(currentSession));
        } catch (error) {
          logger.warn('Failed to store session in sessionStorage:', error);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Clear session storage
        try {
          sessionStorage.removeItem('supabase.auth.session');
        } catch (error) {
          logger.warn('Failed to clear session from sessionStorage:', error);
        }
      }
      
      // Always set auth loading to false after handling auth state change
      setAuthLoading(false);
    }, 300),
    [setSession, setUser, setProfile, setAuthLoading]
  );

  useEffect(() => {
    // logger.debug("Setting up auth state listener");
    let isMounted = true;
    let subscription: any;
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      try {
        const authListener = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!isMounted) return;
            
            // Only process important events
            const importantEvents = ['SIGNED_IN', 'SIGNED_OUT', 'INITIAL_SESSION'];
            if (!importantEvents.includes(event)) {
              // logger.debug('Ignoring auth event:', event);
              return;
            }
            
            // logger.debug('Processing important auth event:', event, !!currentSession);
            handleAuthStateChange(event, currentSession);
          }
        );
        
        subscription = authListener.data?.subscription;

        // Check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        let sessionToUse = currentSession;
        
        // If no current session, try to restore from sessionStorage
        if (!currentSession) {
          try {
            const storedSession = sessionStorage.getItem('supabase.auth.session');
            if (storedSession) {
              const parsedSession = JSON.parse(storedSession);
              // logger.debug("Attempting to restore session from sessionStorage");
              
              // Validate the stored session is still valid
              if (parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) > new Date()) {
                sessionToUse = parsedSession;
              }
            }
          } catch (error) {
            logger.warn('Failed to restore session from sessionStorage:', error);
          }
        }
        
        // logger.debug("Initial session check:", !!sessionToUse);
        
        if (sessionToUse) {
          setSession(sessionToUse);
          setUser(sessionToUse.user);
        }
        
        // Always set auth loading to false after initial session check
        setAuthLoading(false);
      } catch (error) {
        logger.error('Error setting up auth listener:', error);
        setAuthLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [handleAuthStateChange, setSession, setUser, setAuthLoading]);

  // Simplified debug logging
  useEffect(() => {
    const logData = {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      authLoading,
      profileLoading,
      profileLoaded,
      isLoading,
      sessionValid: !!session && session.expires_at && new Date(session.expires_at * 1000) > new Date()
    };
    
    // logger.debug("Auth state update:", logData);
  }, [user, profile, authLoading, profileLoading, profileLoaded, isLoading, session]);

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    isProfileLoaded: profileLoaded,
    login,
    loginWithGoogle,
    loginWithFacebook,
    linkSocialAccount,
    unlinkSocialAccount,
    register,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook with better error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Add additional safety check
  if (context === undefined) {
    logger.error('useAuth called outside of AuthProvider context');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
