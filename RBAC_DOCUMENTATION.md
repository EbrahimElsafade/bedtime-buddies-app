# Role-Based Access Control (RBAC) System

## Overview

This document describes the complete RBAC system implementation for the Dolphoon platform, including roles, permissions, database structure, and frontend/backend authorization.

## Permission Matrix

| Permission | UNAUTHENTICATED | AUTHENTICATED (user) | PREMIUM (subscriber) | EDITOR | ADMIN |
|------------|-----------------|---------------------|---------------------|--------|-------|
| **View free content** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create account** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Manage favorites** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **View premium content** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Edit stories** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Edit courses** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Access admin panel** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage users** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage settings** | ❌ | ❌ | ❌ | ❌ | ✅ |

## Roles Description

### UNAUTHENTICATED (Visitor)
- **Access**: Public pages, free stories, free courses
- **Restrictions**: No account page, no favorites, no premium content
- **Redirects**: Attempting to access protected content → `/login?next=<current-page>`

### AUTHENTICATED (User)
- **Access**: Full website experience except premium content
- **Features**: Account management, favorites, free content
- **Storage**: `user_roles` table with role = `'user'`

### PREMIUM (Subscriber)
- **Access**: Everything AUTHENTICATED can access + premium stories + premium courses
- **Features**: All premium content unlocked
- **Storage**: `user_roles` table with role = `'premium'` OR `profiles.is_premium = true`
- **Note**: Supports both role-based and profile-based premium checks for backward compatibility

### EDITOR
- **Access**: All content creation and editing tools
- **Features**: Can create/edit stories and courses (published and unpublished)
- **Restrictions**: **NO ACCESS** to admin panel, user management, or settings
- **Storage**: `user_roles` table with role = `'editor'`
- **Critical**: Admin routes must be completely hidden from editors

### ADMIN
- **Access**: Full system access
- **Features**: Everything including admin panel, user management, system settings
- **Storage**: `user_roles` table with role = `'admin'`

## Database Structure

### Enum: `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('user', 'premium', 'editor', 'admin');
```

### Table: `user_roles`
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
```

### Helper Functions

#### `has_role(_user_id uuid, _role app_role)`
Checks if a user has a specific role.

#### `has_any_role(_user_id uuid, _roles app_role[])`
Checks if a user has any of the specified roles.

#### `has_premium_access(_user_id uuid)`
Checks premium access via role OR profile flag (backward compatible).

#### `is_admin(_user_id uuid)`
Checks if a user is an admin.

## Frontend Implementation

### Permission Helper (`src/utils/permissions.ts`)
```typescript
import { hasPermission } from '@/utils/permissions'

// Check if user can view premium content
const canView = hasPermission(userRole, 'view_premium_content')
```

### Route Guards

#### `AdminRoute` - Admin-only pages
```typescript
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  {/* Admin routes */}
</Route>
```

#### `EditorRoute` - Editor and Admin only
```typescript
<Route path="/editor" element={<EditorRoute><EditorLayout /></EditorRoute>}>
  {/* Editor routes */}
</Route>
```

#### `ProtectedRoute` - Authenticated users
```typescript
<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
```

### Hooks

#### `useUserRole(user)`
```typescript
const { role, isAdmin, isEditor, isPremium, checkPermission } = useUserRole(user)
```

#### `useRoleManagement(user)`
```typescript
const { isAdmin, isEditor, isPremium, primaryRole, checkPermission } = useRoleManagement(user)
```

## RLS Policies

### Content Access
- **Stories**: Editors can view/edit all, users see published only, premium users see premium content
- **Courses**: Editors can view/edit all, users see published only, premium users see premium content
- **Story Sections**: Based on story free status and user premium access
- **Course Lessons**: Based on lesson free status and user premium access

### Admin Resources
- **User Roles**: Admins can manage, users can view their own
- **Settings**: Admin-only access
- **Categories**: Admin-only management
- **Storage**: Admin-only for admin-content bucket

## Migration Summary

### What Was Done
1. ✅ Added `premium` and `editor` to `app_role` enum
2. ✅ Migrated `moderator` role to `user` (safe fallback)
3. ✅ Added `premium` role to users with `is_premium = true`
4. ✅ Created helper functions: `has_any_role`, `has_premium_access`
5. ✅ Updated all RLS policies to support new roles
6. ✅ Created editor policies for story/course management
7. ✅ Updated frontend types, hooks, and route guards

### Backward Compatibility
- ✅ Premium access checks both role AND profile flag
- ✅ Existing users with `is_premium = true` automatically get premium role
- ✅ Existing admin users retain admin access

## Deployment Checklist

### Pre-Deployment
- [x] Database migrations applied successfully
- [x] All RLS policies updated
- [x] Frontend types updated
- [x] Route guards implemented
- [x] Permission helpers created

### Post-Deployment
- [ ] Test unauthenticated access (should only see free content)
- [ ] Test user login (should see account & favorites, no premium)
- [ ] Test premium access (should see all premium content)
- [ ] Test editor access (should edit stories/courses, NO admin panel)
- [ ] Test admin access (should see everything including admin panel)
- [ ] Verify editors cannot access `/admin/*` routes
- [ ] Verify protected routes redirect to `/login` with return URL

### Testing Scenarios
1. **Unauthenticated**: Navigate to premium story → Redirect to login
2. **User**: Navigate to premium content → See upgrade prompt
3. **Premium**: Access premium story → Full access
4. **Editor**: Navigate to `/admin` → 404 error (critical!)
5. **Editor**: Navigate to story editor → Full access
6. **Admin**: Navigate to `/admin/users` → Full access

## Rollback Plan

### Quick Rollback (if issues occur)
1. **Revert Frontend Changes**: Deploy previous version
2. **Keep Database Changes**: New roles are backward compatible
3. **Monitor**: Check logs for role-related errors

### Full Rollback (if critical failure)
```sql
-- Remove new enum values (requires dropping dependencies)
-- NOT RECOMMENDED - use quick rollback instead
```

### Safe Approach
- Database changes are additive and backward compatible
- Frontend can be rolled back independently
- Premium check supports both old (profile flag) and new (role) methods

## Security Notes

1. **Editor Isolation**: Editors MUST NOT access admin routes - enforced at route guard level
2. **RLS Protection**: All content access controlled by database-level policies
3. **Token Validation**: Authentication checked before any role checks
4. **Audit Trail**: All role changes logged in `user_role_audit_log`

## Future Enhancements

- [ ] Multi-role support (user can have multiple active roles)
- [ ] Role expiration dates
- [ ] Granular permissions (per-story, per-course access)
- [ ] Role inheritance system
- [ ] Self-service role upgrades

---

**Last Updated**: 2025-11-03  
**Migration Version**: 20251101_rbac_overhaul  
**Status**: Production Ready ✅
