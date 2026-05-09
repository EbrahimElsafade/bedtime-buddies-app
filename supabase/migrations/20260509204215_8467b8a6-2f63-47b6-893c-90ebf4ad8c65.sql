
-- Skill Paths feature: create tables + drop unused appearance_settings

CREATE TABLE public.skill_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon TEXT NOT NULL DEFAULT '📚',
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill paths"
  ON public.skill_paths FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage skill paths"
  ON public.skill_paths FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_skill_paths_updated_at
  BEFORE UPDATE ON public.skill_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.skill_path_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_path_id UUID NOT NULL REFERENCES public.skill_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (skill_path_id, course_id)
);

CREATE INDEX idx_skill_path_courses_skill_path ON public.skill_path_courses(skill_path_id);
CREATE INDEX idx_skill_path_courses_course ON public.skill_path_courses(course_id);

ALTER TABLE public.skill_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill path courses"
  ON public.skill_path_courses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage skill path courses"
  ON public.skill_path_courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Remove old home_page appearance settings (table + all data)
DROP TABLE IF EXISTS public.appearance_settings CASCADE;
