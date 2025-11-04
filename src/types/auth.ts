import { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'premium' | 'editor' | 'admin'

export type Permission =
  | 'view_free_content'
  | 'create_account'
  | 'manage_favorites'
  | 'view_premium_content'
  | 'edit_stories'
  | 'edit_courses'
  | 'access_admin'
  | 'manage_users'
  | 'manage_settings'

export type SocialAccount = 'facebook' | 'google'

export type Profile = {
  id: string
  parent_name: string
  child_name?: string
  preferred_language: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  is_premium: boolean
  subscription_tier?: string
  subscription_end?: string
  profile_image?: string
  linked_accounts?: SocialAccount[]
  skills?: string[]
}

export interface UserWithRoles {
  id: string
  roles: Array<{ role: UserRole }>
}

export type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isProfileLoaded: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  linkSocialAccount: (provider: SocialAccount) => Promise<void>
  unlinkSocialAccount: (provider: SocialAccount) => Promise<void>
  register: (
    email: string,
    password: string,
    parentName: string,
    childName?: string,
    preferredLanguage?: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr',
  ) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}
