
-- Fix the handle_new_user() function to set secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    parent_name, 
    child_name, 
    preferred_language
  )
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'parent_name', new.email),
    new.raw_user_meta_data->>'child_name',
    coalesce(new.raw_user_meta_data->>'preferred_language', 'ar-eg')
  );
  RETURN new;
END;
$function$;

-- Fix the is_admin() function without parameters to set secure search path
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix the is_admin(uid uuid) function to set secure search path
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin'
  );
$function$;
