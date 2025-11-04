-- ============================================
-- RBAC Part 2: Complete System Overhaul
-- ============================================

-- Step 1: Drop ALL dependent policies
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can delete content" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update content" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage appearance settings" ON appearance_settings;
DROP POLICY IF EXISTS "Admins can manage course categories" ON course_categories;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all translations" ON scene_translations;
DROP POLICY IF EXISTS "Admins can manage all stories" ON stories;
DROP POLICY IF EXISTS "Admins can manage categories" ON story_categories;
DROP POLICY IF EXISTS "Admins can manage languages" ON story_languages;
DROP POLICY IF EXISTS "Admins can manage all scenes" ON story_scenes;
DROP POLICY IF EXISTS "Admins can manage all story sections" ON story_sections;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON course_lessons;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON user_role_audit_log;
DROP POLICY IF EXISTS "Users can view story sections based on subscription" ON story_sections;
DROP POLICY IF EXISTS "Users can view lessons based on subscription" ON course_lessons;
DROP POLICY IF EXISTS "Public can view published stories" ON stories;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Public can view scenes of published stories" ON story_scenes;

-- Step 2: Drop triggers and functions
DROP TRIGGER IF EXISTS on_role_change ON user_roles;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.log_role_change() CASCADE;

-- Step 3: Update audit log
ALTER TABLE public.user_role_audit_log DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE public.user_role_audit_log ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Step 4: Migrate moderator to user
UPDATE public.user_roles SET role = 'user'::app_role WHERE role = 'moderator'::app_role;

-- Step 5: Add premium role to existing premium users
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'premium'::public.app_role
FROM public.profiles p
WHERE p.is_premium = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Create helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('premium', 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND is_premium = true AND (subscription_end IS NULL OR subscription_end > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(COALESCE(_user_id, auth.uid()), 'admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.user_role_audit_log (user_id, role, action, performed_by)
    VALUES (NEW.user_id, NEW.role::text, 'granted', auth.uid());
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.user_role_audit_log (user_id, role, action, performed_by)
    VALUES (OLD.user_id, OLD.role::text, 'revoked', auth.uid());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_role_change
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- Step 7: Recreate RLS policies
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can upload content" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'admin-content' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Only admins can update content" ON storage.objects FOR UPDATE
  USING (bucket_id = 'admin-content' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Only admins can delete content" ON storage.objects FOR DELETE
  USING (bucket_id = 'admin-content' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage all course videos" ON storage.objects FOR ALL
  USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can manage appearance settings" ON appearance_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage course categories" ON course_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage categories" ON story_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage languages" ON story_languages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Only admins can view audit logs" ON user_role_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Public can view published stories" ON stories FOR SELECT USING (is_published = true);
CREATE POLICY "Editors can view unpublished stories" ON stories FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can insert stories" ON stories FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can update stories" ON stories FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Admins can delete stories" ON stories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Public can view scenes of published stories" ON story_scenes FOR SELECT
  USING (story_id IN (SELECT id FROM stories WHERE is_published = true));
CREATE POLICY "Editors can manage story sections" ON story_sections FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can manage translations" ON scene_translations FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can manage scenes" ON story_scenes FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));

CREATE POLICY "Public can view published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Editors can view unpublished courses" ON courses FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can insert courses" ON courses FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Editors can update courses" ON courses FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Editors can manage course lessons" ON course_lessons FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[]));

CREATE POLICY "Users can view story sections based on subscription" ON story_sections FOR SELECT
  USING (
    story_id IN (
      SELECT s.id FROM stories s WHERE s.is_published = true
      AND (s.is_free = true OR (auth.uid() IS NOT NULL AND public.has_premium_access(auth.uid())))
    )
  );
CREATE POLICY "Users can view lessons based on subscription" ON course_lessons FOR SELECT
  USING (
    is_free = true
    OR course_id IN (SELECT id FROM courses WHERE is_free = true AND is_published = true)
    OR (auth.uid() IS NOT NULL AND public.has_premium_access(auth.uid()))
  );