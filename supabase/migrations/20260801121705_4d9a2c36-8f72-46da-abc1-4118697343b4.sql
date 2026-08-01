ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 100;

CREATE TABLE IF NOT EXISTS public.course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  granted_by uuid,
  source text NOT NULL DEFAULT 'admin_grant',
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_purchases TO authenticated;
GRANT ALL ON public.course_purchases TO service_role;

ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course purchases"
ON public.course_purchases FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can grant course purchases"
ON public.course_purchases FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update course purchases"
ON public.course_purchases FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can revoke course purchases"
ON public.course_purchases FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_course_purchases_updated_at
BEFORE UPDATE ON public.course_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_course(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_purchases
    WHERE user_id = _user_id AND course_id = _course_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_premium_access(_user_id) OR public.owns_course(_user_id, _course_id);
$$;

REVOKE EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_course(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_course(uuid, uuid) TO authenticated, service_role;