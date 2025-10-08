-- Clean up duplicate and overlapping RLS policies on profiles table
-- This addresses the "User Personal Information Could Be Stolen" warning

-- Drop all duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Drop duplicate UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create a single, consolidated SELECT policy
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id OR is_admin());

-- Create a single, consolidated UPDATE policy
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- The admin policies and insert policy remain unchanged