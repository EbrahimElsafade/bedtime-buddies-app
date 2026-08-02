GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_section_progress TO authenticated;
GRANT ALL ON public.user_section_progress TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.course_lesson_watch_progress TO authenticated;
GRANT ALL ON public.course_lesson_watch_progress TO service_role;

REVOKE ALL ON FUNCTION public.record_course_lesson_watch_progress(uuid, uuid, uuid, integer, integer, boolean, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_course_lesson_watch_progress(uuid, uuid, uuid, integer, integer, boolean, numeric) TO authenticated, service_role;