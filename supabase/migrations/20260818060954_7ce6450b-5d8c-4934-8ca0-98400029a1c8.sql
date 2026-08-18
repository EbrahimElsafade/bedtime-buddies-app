-- 1. Hide the actual video sources from ordinary clients.
REVOKE SELECT ON public.course_lessons FROM anon, authenticated;

GRANT SELECT (
  id, course_id, title, description, duration, created_at, updated_at,
  thumbnail_path, lesson_order, title_en, title_ar, title_fr,
  description_en, description_ar, description_fr, is_free
) ON public.course_lessons TO anon, authenticated;

GRANT ALL ON public.course_lessons TO service_role;

-- 2. Gated accessor for the real video source.
CREATE OR REPLACE FUNCTION public.get_lesson_video_source(_lesson_id uuid)
RETURNS TABLE (video_url text, video_path text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lesson RECORD;
  _uid uuid := auth.uid();
BEGIN
  SELECT l.video_url, l.video_path, l.is_free, l.course_id,
         c.is_free AS course_free, c.is_published
    INTO _lesson
  FROM public.course_lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = _lesson_id;

  IF _lesson IS NULL THEN
    RETURN;
  END IF;

  -- Staff always sees everything (also needed for unpublished previews).
  IF _uid IS NOT NULL AND public.has_any_role(_uid, ARRAY['editor'::app_role, 'admin'::app_role]) THEN
    RETURN QUERY SELECT _lesson.video_url, _lesson.video_path;
    RETURN;
  END IF;

  IF NOT _lesson.is_published THEN
    RETURN;
  END IF;

  -- Free lesson or fully free course.
  IF _lesson.is_free OR _lesson.course_free THEN
    RETURN QUERY SELECT _lesson.video_url, _lesson.video_path;
    RETURN;
  END IF;

  -- Paid lesson: requires purchase or active membership.
  IF _uid IS NOT NULL AND public.has_course_access(_uid, _lesson.course_id) THEN
    RETURN QUERY SELECT _lesson.video_url, _lesson.video_path;
    RETURN;
  END IF;

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.get_lesson_video_source(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_lesson_video_source(uuid) TO anon, authenticated, service_role;

-- 3. Editors/admins still need full rows for the course editor.
CREATE OR REPLACE FUNCTION public.admin_get_course_lessons(_course_id uuid)
RETURNS SETOF public.course_lessons
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_any_role(auth.uid(), ARRAY['editor'::app_role, 'admin'::app_role]) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT * FROM public.course_lessons
  WHERE course_id = _course_id
  ORDER BY lesson_order ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_course_lessons(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_get_course_lessons(uuid) TO authenticated, service_role;