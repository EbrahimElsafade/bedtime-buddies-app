CREATE OR REPLACE FUNCTION public.record_content_progress(
  _user_id uuid,
  _content_type text,
  _content_id uuid,
  _parent_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{"newly_completed": false, "points_awarded": false, "progress_recorded": false}'::jsonb;
  is_complete boolean := false;
  parent_type text;
  progress_inserted boolean := false;
  finished_inserted boolean := false;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not allowed to record progress for this user';
  END IF;

  IF _content_type = 'course_lesson' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.course_lessons
      WHERE id = _content_id AND course_id = _parent_id
    ) THEN
      RAISE EXCEPTION 'Lesson does not belong to this course';
    END IF;
    parent_type := 'course';
  ELSIF _content_type = 'story_section' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.story_sections
      WHERE id = _content_id AND story_id = _parent_id
    ) THEN
      RAISE EXCEPTION 'Section does not belong to this story';
    END IF;
    parent_type := 'story';
  ELSE
    RAISE EXCEPTION 'Unsupported content type';
  END IF;

  INSERT INTO public.user_section_progress (user_id, content_type, content_id, parent_id)
  VALUES (_user_id, _content_type, _content_id, _parent_id)
  ON CONFLICT (user_id, content_type, content_id) DO NOTHING;
  GET DIAGNOSTICS progress_inserted = ROW_COUNT;

  IF _content_type = 'story_section' THEN
    is_complete := public.check_story_completion(_user_id, _parent_id);
  ELSE
    is_complete := public.check_course_completion(_user_id, _parent_id);
  END IF;

  IF is_complete THEN
    INSERT INTO public.user_finished_content (user_id, content_type, content_id)
    VALUES (_user_id, parent_type, _parent_id)
    ON CONFLICT (user_id, content_type, content_id) DO NOTHING;
    GET DIAGNOSTICS finished_inserted = ROW_COUNT;

    IF finished_inserted THEN
      UPDATE public.profiles
      SET total_points = total_points + 1,
          updated_at = now()
      WHERE id = _user_id;

      PERFORM public.update_user_milestones(_user_id);
    END IF;
  END IF;

  result := jsonb_build_object(
    'newly_completed', finished_inserted,
    'points_awarded', finished_inserted,
    'progress_recorded', progress_inserted,
    'is_complete', is_complete
  );
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_course_lesson_watch_progress(
  _user_id uuid,
  _course_id uuid,
  _lesson_id uuid,
  _watched_seconds integer DEFAULT 0,
  _duration_seconds integer DEFAULT 0,
  _explicit_complete boolean DEFAULT false,
  _completion_threshold numeric DEFAULT 85
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_watched integer := greatest(coalesce(_watched_seconds, 0), 0);
  normalized_duration integer := greatest(coalesce(_duration_seconds, 0), 0);
  calculated_percent numeric(5,2) := 0;
  should_complete boolean := false;
  progress_result jsonb := '{"newly_completed": false, "points_awarded": false, "progress_recorded": false}'::jsonb;
  lesson_completed boolean := false;
  completed_lessons integer := 0;
  total_lessons integer := 0;
  course_progress integer := 0;
  finished_id uuid;
  finished_at timestamptz;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not allowed to record watch progress for this user';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.course_lessons
    WHERE id = _lesson_id AND course_id = _course_id
  ) THEN
    RAISE EXCEPTION 'Lesson does not belong to this course';
  END IF;

  IF normalized_duration > 0 THEN
    calculated_percent := least(100, round((normalized_watched::numeric / normalized_duration::numeric) * 100, 2));
  ELSIF _explicit_complete THEN
    calculated_percent := 100;
  END IF;

  should_complete := _explicit_complete
    OR calculated_percent >= least(greatest(coalesce(_completion_threshold, 85), 1), 100);

  INSERT INTO public.course_lesson_watch_progress (
    user_id, course_id, lesson_id, watched_seconds, duration_seconds,
    watched_percent, completed_at, last_watched_at
  ) VALUES (
    _user_id, _course_id, _lesson_id, normalized_watched, normalized_duration,
    calculated_percent, CASE WHEN should_complete THEN now() ELSE NULL END, now()
  )
  ON CONFLICT (user_id, lesson_id) DO UPDATE
  SET course_id = excluded.course_id,
      watched_seconds = greatest(public.course_lesson_watch_progress.watched_seconds, excluded.watched_seconds),
      duration_seconds = greatest(public.course_lesson_watch_progress.duration_seconds, excluded.duration_seconds),
      watched_percent = greatest(public.course_lesson_watch_progress.watched_percent, excluded.watched_percent),
      completed_at = coalesce(public.course_lesson_watch_progress.completed_at, excluded.completed_at),
      last_watched_at = now();

  IF should_complete OR EXISTS (
    SELECT 1
    FROM public.course_lesson_watch_progress
    WHERE user_id = _user_id AND lesson_id = _lesson_id AND completed_at IS NOT NULL
  ) THEN
    progress_result := public.record_content_progress(
      _user_id, 'course_lesson', _lesson_id, _course_id
    );
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_section_progress
    WHERE user_id = _user_id
      AND content_type = 'course_lesson'
      AND content_id = _lesson_id
      AND parent_id = _course_id
  ) INTO lesson_completed;

  SELECT count(*)::integer
  INTO total_lessons
  FROM public.course_lessons
  WHERE course_id = _course_id;

  SELECT count(DISTINCT usp.content_id)::integer
  INTO completed_lessons
  FROM public.user_section_progress usp
  JOIN public.course_lessons cl
    ON cl.id = usp.content_id
   AND cl.course_id = _course_id
  WHERE usp.user_id = _user_id
    AND usp.content_type = 'course_lesson'
    AND usp.parent_id = _course_id;

  course_progress := CASE
    WHEN total_lessons <= 0 THEN 0
    ELSE least(100, round((completed_lessons::numeric / total_lessons::numeric) * 100)::integer)
  END;

  SELECT id, user_finished_content.finished_at
  INTO finished_id, finished_at
  FROM public.user_finished_content
  WHERE user_id = _user_id
    AND content_type = 'course'
    AND content_id = _course_id;

  RETURN jsonb_build_object(
    'completed', lesson_completed,
    'lesson_newly_completed', coalesce((progress_result->>'progress_recorded')::boolean, false),
    'watched_percent', calculated_percent,
    'completed_lessons', completed_lessons,
    'total_lessons', total_lessons,
    'course_progress', course_progress,
    'course_complete', finished_id IS NOT NULL,
    'course_newly_completed', coalesce((progress_result->>'newly_completed')::boolean, false),
    'points_awarded', coalesce((progress_result->>'points_awarded')::boolean, false),
    'completion_id', finished_id,
    'completed_at', finished_at
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.record_course_lesson_watch_progress(uuid, uuid, uuid, integer, integer, boolean, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_course_lesson_watch_progress(uuid, uuid, uuid, integer, integer, boolean, numeric) TO authenticated, service_role;