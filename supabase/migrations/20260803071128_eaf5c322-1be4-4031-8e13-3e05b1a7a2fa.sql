-- 1. Remove orphaned lesson progress rows (lesson deleted or moved to another course)
DELETE FROM public.user_section_progress usp
WHERE usp.content_type = 'course_lesson'
  AND NOT EXISTS (
    SELECT 1 FROM public.course_lessons cl
    WHERE cl.id = usp.content_id AND cl.course_id = usp.parent_id
  );

DELETE FROM public.course_lesson_watch_progress w
WHERE NOT EXISTS (
  SELECT 1 FROM public.course_lessons cl
  WHERE cl.id = w.lesson_id AND cl.course_id = w.course_id
);

-- 2. Fix completion check so only lessons still in the course count
CREATE OR REPLACE FUNCTION public.check_course_completion(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  total_lessons integer;
  completed_lessons integer;
begin
  select count(*) into total_lessons
  from public.course_lessons
  where course_id = _course_id;

  select count(*) into completed_lessons
  from public.user_section_progress usp
  join public.course_lessons cl
    on cl.id = usp.content_id
   and cl.course_id = _course_id
  where usp.user_id = _user_id
    and usp.content_type = 'course_lesson'
    and usp.parent_id = _course_id;

  return total_lessons > 0 and completed_lessons >= total_lessons;
end;
$function$;

-- 3. Drop "finished course" records that are no longer actually complete
DELETE FROM public.user_finished_content ufc
WHERE ufc.content_type = 'course'
  AND NOT public.check_course_completion(ufc.user_id, ufc.content_id);

-- 4. Recalculate points and milestones from real finished content
UPDATE public.profiles p
SET total_points = COALESCE(f.cnt, 0),
    unlocked_milestones = (
      SELECT COALESCE(array_agg(idx ORDER BY idx), ARRAY[]::integer[])
      FROM (
        SELECT i AS idx, th
        FROM unnest(ARRAY[5,10,25,50,100]) WITH ORDINALITY AS t(th, i)
      ) m
      WHERE COALESCE(f.cnt, 0) >= m.th
    ),
    updated_at = now()
FROM (
  SELECT id FROM public.profiles
) ids
LEFT JOIN (
  SELECT user_id, count(*)::integer AS cnt
  FROM public.user_finished_content
  GROUP BY user_id
) f ON f.user_id = ids.id
WHERE p.id = ids.id;

-- 5. Auto-cleanup progress rows when a lesson is deleted
CREATE OR REPLACE FUNCTION public.cleanup_lesson_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.user_section_progress
  WHERE content_type = 'course_lesson' AND content_id = OLD.id;

  DELETE FROM public.course_lesson_watch_progress
  WHERE lesson_id = OLD.id;

  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS cleanup_lesson_progress_trg ON public.course_lessons;
CREATE TRIGGER cleanup_lesson_progress_trg
AFTER DELETE ON public.course_lessons
FOR EACH ROW EXECUTE FUNCTION public.cleanup_lesson_progress();