
CREATE OR REPLACE FUNCTION public.record_content_progress(_user_id uuid, _content_type text, _content_id uuid, _parent_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB := '{"newly_completed": false, "points_awarded": false}'::jsonb;
  is_complete BOOLEAN;
  parent_type TEXT;
  already_finished BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not allowed to record progress for this user';
  END IF;

  INSERT INTO public.user_section_progress (user_id, content_type, content_id, parent_id)
  VALUES (_user_id, _content_type, _content_id, _parent_id)
  ON CONFLICT (user_id, content_type, content_id) DO NOTHING;

  IF _content_type = 'story_section' THEN
    parent_type := 'story';
    is_complete := public.check_story_completion(_user_id, _parent_id);
  ELSIF _content_type = 'course_lesson' THEN
    parent_type := 'course';
    is_complete := public.check_course_completion(_user_id, _parent_id);
  ELSE
    RETURN result;
  END IF;

  IF is_complete THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_finished_content
      WHERE user_id = _user_id
        AND content_type = parent_type
        AND content_id = _parent_id
    ) INTO already_finished;

    IF NOT already_finished THEN
      INSERT INTO public.user_finished_content (user_id, content_type, content_id)
      VALUES (_user_id, parent_type, _parent_id);

      UPDATE public.profiles
      SET total_points = total_points + 1,
          updated_at = now()
      WHERE id = _user_id;

      PERFORM public.update_user_milestones(_user_id);

      result := '{"newly_completed": true, "points_awarded": true}'::jsonb;
    END IF;
  END IF;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) TO authenticated, service_role;
