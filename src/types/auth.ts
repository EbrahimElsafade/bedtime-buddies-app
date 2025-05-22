
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  parent_name: string;
  child_name?: string;
  preferred_language: 'en' | 'ar-eg' | 'ar-fos7a';
  is_premium: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  role: 'user' | 'admin';
};

export type AuthContextType = {
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
