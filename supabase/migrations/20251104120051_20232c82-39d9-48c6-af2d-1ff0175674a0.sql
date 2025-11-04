-- ============================================
-- RBAC Part 1: Add New Enum Values
-- ============================================

-- Add new role values to enum (must be in separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'premium';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';