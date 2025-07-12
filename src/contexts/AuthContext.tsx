
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from '@/hooks/useAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AuthContextType } from '@/types/auth';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Debounced auth state handler to prevent rapid changes
  const debouncedAuthStateHandler = useCallback(
    debounce(async (event: string, currentSession: any) => {
      console.log('Debounced auth state changed:', event, currentSession?.user?.email);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Store session in sessionStorage as backup
        try {
          sessionStorage.setItem('supabase.auth.session', JSON.stringify(currentSession));
        } catch (error) {
          console.warn('Failed to store session in sessionStorage:', error);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Clear session storage
        try {
          sessionStorage.removeItem('supabase.auth.session');
        } catch (error) {
          console.warn('Failed to clear session from sessionStorage:', error);
        }
      }
      
      // Always set auth loading to false after handling auth state change
      setAuthLoading(false);
    }, 300),
    [setSession, setUser, setProfile, setAuthLoading]
  );

  useEffect(() => {
    console.log("Setting up enhanced auth state listener");
    let isMounted = true;
    let subscription: any;
    
    // Set up auth state listener first
    const setupAuthListener = async () => {
      try {
        const authListener = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!isMounted) return;
            
            console.log('Raw auth state change:', event, !!currentSession);
            debouncedAuthStateHandler(event, currentSession);
          }
        );
        
        subscription = authListener.data?.subscription;

        // Check for existing session with fallback to sessionStorage
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        let sessionToUse = currentSession;
        
        // If no current session, try to restore from sessionStorage
        if (!currentSession) {
          try {
            const storedSession = sessionStorage.getItem('supabase.auth.session');
            if (storedSession) {
              const parsedSession = JSON.parse(storedSession);
              console.log("Attempting to restore session from sessionStorage");
              
              // Validate the stored session is still valid
              if (parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) > new Date()) {
                sessionToUse = parsedSession;
              }
            }
          } catch (error) {
            console.warn('Failed to restore session from sessionStorage:', error);
          }
        }
        
        console.log("Initial session check:", !!sessionToUse);
        
        if (sessionToUse) {
          setSession(sessionToUse);
          setUser(sessionToUse.user);
        }
        
        // Always set auth loading to false after initial session check
        setAuthLoading(false);
      } catch (error) {
        console.error('Error setting up auth listener:', error);
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
  }, [debouncedAuthStateHandler, setSession, setUser, setAuthLoading]);

  // Enhanced debug logging for auth state
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
      profileError: profileError?.message,
      sessionValid: !!session && session.expires_at && new Date(session.expires_at * 1000) > new Date()
    };
    
    console.log("Enhanced auth state:", logData);
  }, [user, profile, authLoading, profileLoading, profileLoaded, profileError, isLoading, session]);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
