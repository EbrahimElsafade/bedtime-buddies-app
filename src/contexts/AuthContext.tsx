
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from '@/hooks/useAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AuthContextType } from '@/types/auth';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    console.log("Setting up auth state listener");
    let isMounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!isMounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Always set auth loading to false after handling auth state change
        setAuthLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Checking existing session:", currentSession?.user?.email);
      
      if (!isMounted) return;
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
      
      // Always set auth loading to false after initial session check
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Debug the auth state
  useEffect(() => {
    console.log("Auth state updated:", { 
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      authLoading,
      profileLoading,
      profileLoaded,
      isLoading,
      profileError: profileError?.message
    });
  }, [user, profile, authLoading, profileLoading, profileLoaded, profileError, isLoading]);

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
