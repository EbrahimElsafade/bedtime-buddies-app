DROP POLICY IF EXISTS "Anyone can submit specialist requests" ON public.specialist_requests;
REVOKE INSERT ON public.specialist_requests FROM anon, authenticated;
GRANT ALL ON public.specialist_requests TO service_role;