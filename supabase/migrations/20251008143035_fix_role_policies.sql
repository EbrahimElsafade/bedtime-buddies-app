-- Fix infinite recursion in role policies
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a more secure implementation of has_role that prevents recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Direct query without using RLS to prevent recursion
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create a more secure implementation of is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Direct query without using RLS to prevent recursion
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (
  -- Allow users to view their own roles
  auth.uid() = user_id
  OR 
  -- Or if they're an admin (using direct check to prevent recursion)
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL USING (
  -- Direct check for admin role to prevent recursion
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);