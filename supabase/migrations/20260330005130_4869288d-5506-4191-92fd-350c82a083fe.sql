
-- Make the course-videos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'course-videos';

-- Ensure editors/admins can upload to course-videos
CREATE POLICY "Editors can upload to course-videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos'
  AND public.has_any_role(auth.uid(), ARRAY['editor'::public.app_role, 'admin'::public.app_role])
);

-- Ensure editors/admins can update files in course-videos
CREATE POLICY "Editors can update course-videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND public.has_any_role(auth.uid(), ARRAY['editor'::public.app_role, 'admin'::public.app_role])
);

-- Ensure editors/admins can delete files in course-videos
CREATE POLICY "Editors can delete course-videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND public.has_any_role(auth.uid(), ARRAY['editor'::public.app_role, 'admin'::public.app_role])
);

-- Allow authenticated users to read course-videos for signed URL generation
-- The actual content access control is handled by the edge function
CREATE POLICY "Authenticated users can read course-videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
);
