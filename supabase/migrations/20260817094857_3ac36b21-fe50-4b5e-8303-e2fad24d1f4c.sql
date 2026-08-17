CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trusted internal progress functions flag themselves for the transaction.
  IF coalesce(current_setting('app.gamification_write', true), '') = 'on' THEN
    RETURN NEW;
  END IF;

  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
     OR current_user = 'service_role'
     OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
     OR NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end
     OR NEW.total_points IS DISTINCT FROM OLD.total_points
     OR NEW.unlocked_milestones IS DISTINCT FROM OLD.unlocked_milestones THEN
    RAISE EXCEPTION 'Not allowed to modify subscription or gamification fields on your own profile';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_content_progress(_user_id uuid, _content_type text, _content_id uuid, _parent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      SELECT 1 FROM public.course_lessons
      WHERE id = _content_id AND course_id = _parent_id
    ) THEN
      RAISE EXCEPTION 'Lesson does not belong to this course';
    END IF;
    parent_type := 'course';
  ELSIF _content_type = 'story_section' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.story_sections
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
      -- Flag this transaction as a trusted gamification write.
      PERFORM set_config('app.gamification_write', 'on', true);

      UPDATE public.profiles
      SET total_points = total_points + 1,
          updated_at = now()
      WHERE id = _user_id;

      PERFORM public.update_user_milestones(_user_id);

      PERFORM set_config('app.gamification_write', 'off', true);
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
$$;

REVOKE ALL ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_content_progress(uuid, text, uuid, uuid) TO authenticated, service_role;