-- Phase 1: Fix Privilege Escalation Vulnerability
-- Step 1: Create role infrastructure

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 2: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Step 3: Migrate existing admin roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrate all users to have 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM public.profiles
WHERE role = 'user' OR role IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Update is_admin() functions to use new role system
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(uid, 'admin');
$$;

-- Step 5: Update storage policies to use has_role instead of profiles.role
DROP POLICY IF EXISTS "Only admins can delete content" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update content" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all course videos" ON storage.objects;

CREATE POLICY "Only admins can delete content"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update content"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can upload content"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all course videos"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'course-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Step 6: Update all RLS policies to use the new has_role function
-- appearance_settings
DROP POLICY IF EXISTS "Admins can manage appearance settings" ON appearance_settings;
CREATE POLICY "Admins can manage appearance settings"
ON appearance_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- course_categories
DROP POLICY IF EXISTS "Admins can manage course categories" ON course_categories;
CREATE POLICY "Admins can manage course categories"
ON course_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- courses
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "Admins can manage all courses"
ON courses
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- scene_translations
DROP POLICY IF EXISTS "Admins can manage all translations" ON scene_translations;
CREATE POLICY "Admins can manage all translations"
ON scene_translations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- stories
DROP POLICY IF EXISTS "Admins can manage all stories" ON stories;
CREATE POLICY "Admins can manage all stories"
ON stories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- story_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON story_categories;
CREATE POLICY "Admins can manage categories"
ON story_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- story_languages
DROP POLICY IF EXISTS "Admins can manage languages" ON story_languages;
CREATE POLICY "Admins can manage languages"
ON story_languages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- story_scenes
DROP POLICY IF EXISTS "Admins can manage all scenes" ON story_scenes;
CREATE POLICY "Admins can manage all scenes"
ON story_scenes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- story_sections
DROP POLICY IF EXISTS "Admins can manage all story sections" ON story_sections;
CREATE POLICY "Admins can manage all story sections"
ON story_sections
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- course_lessons
DROP POLICY IF EXISTS "Admins can manage all lessons" ON course_lessons;
CREATE POLICY "Admins can manage all lessons"
ON course_lessons
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- profiles admin policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR ALL
USING (is_admin() OR (auth.uid() = id));

-- Step 7: Remove role column from profiles (data already migrated)
ALTER TABLE public.profiles DROP COLUMN role;