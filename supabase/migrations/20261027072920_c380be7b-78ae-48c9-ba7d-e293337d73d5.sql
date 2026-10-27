CREATE OR REPLACE FUNCTION public.get_lesson_video_source(_lesson_id uuid)
 RETURNS TABLE(video_url text, video_path text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _lesson RECORD; _uid uuid := auth.uid();
BEGIN
  SELECT l.video_url, l.video_path, c.is_published INTO _lesson
  FROM public.course_lessons l JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = _lesson_id;
  IF _lesson IS NULL THEN RETURN; END IF;
  IF _lesson.is_published OR (_uid IS NOT NULL AND public.has_any_role(_uid, ARRAY['editor'::app_role,'admin'::app_role])) THEN
    RETURN QUERY SELECT _lesson.video_url, _lesson.video_path;
  END IF;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.get_lesson_video_source(uuid) TO anon, authenticated;