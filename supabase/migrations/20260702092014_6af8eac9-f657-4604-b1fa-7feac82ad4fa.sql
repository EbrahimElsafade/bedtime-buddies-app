CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Staff (admin) always retains access; premium end-users must have an
  -- active, non-expired subscription. A NULL/invalid subscription_end
  -- is treated as expired.
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND is_premium = true
      AND subscription_end IS NOT NULL
      AND subscription_end > now()
  );
$$;