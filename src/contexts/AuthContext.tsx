
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from '@/hooks/useAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AuthContextType } from '@/types/auth';

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
    isLoading: profileLoading
  } = useProfileManagement(user);

  // Combined loading state
  const isLoading = authLoading || (user != null && profileLoading);

  useEffect(() => {
    console.log("Setting up auth state listener");
    let isMounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!isMounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Checking existing session:", currentSession?.user?.email);
      
      if (!isMounted) return;
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
