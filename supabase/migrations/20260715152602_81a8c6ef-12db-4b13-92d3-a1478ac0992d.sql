CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role (edge functions using SUPABASE_SERVICE_ROLE_KEY) to bypass.
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
     OR current_user = 'service_role'
     OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may change anything.
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