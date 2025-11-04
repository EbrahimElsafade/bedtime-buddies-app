/**
 * Centralized Permission System
 * Maps roles to specific permissions for authorization checks
 */

import { UserRole, Permission } from '@/types/auth'

// Permission Matrix: Defines what each role can do
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'view_free_content',
    'create_account',
    'manage_favorites',
  ],
  premium: [
    'view_free_content',
    'create_account',
    'manage_favorites',
    'view_premium_content',
  ],
  editor: [
    'view_free_content',
    'create_account',
    'manage_favorites',
    'view_premium_content',
    'edit_stories',
    'edit_courses',
  ],
  admin: [
    'view_free_content',
    'create_account',
    'manage_favorites',
    'view_premium_content',
    'edit_stories',
    'edit_courses',
    'access_admin',
    'manage_users',
    'manage_settings',
  ],
}

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole | null, permission: Permission): boolean => {
  if (!role) return permission === 'view_free_content'
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole | null, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole | null, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole | null): Permission[] => {
  if (!role) return ['view_free_content']
  return ROLE_PERMISSIONS[role] ?? []
}
