-- Block direct anon/authenticated INSERTs to specialist_requests; require edge function (service role)
REVOKE INSERT ON public.specialist_requests FROM anon, authenticated;
CREATE POLICY "Block direct client inserts on specialist_requests"
  ON public.specialist_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Remove broad authenticated read on course-videos bucket; rely on premium-scoped policy
DROP POLICY IF EXISTS "Authenticated users can read course-videos" ON storage.objects;