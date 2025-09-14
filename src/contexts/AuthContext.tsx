
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from '@/hooks/useAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AuthContextType } from '@/types/auth';
import { logger } from '@/utils/logger';

// Create the context with a default value to prevent undefined context errors
const defaultContextValue: AuthContextType = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isProfileLoaded: false,
  login: async () => { throw new Error('AuthProvider not initialized') },
  loginWithGoogle: async () => { throw new Error('AuthProvider not initialized') },
  loginWithApple: async () => { throw new Error('AuthProvider not initialized') },
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
  const {
    user,
    setUser,
    session,
    setSession,
    isLoading: authLoading,
    setIsLoading: setAuthLoading,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    resetPassword
  } = useAuthOperations();

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
      profileRole: profile?.role,
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
    loginWithApple,
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
