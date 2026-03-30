
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Allow everyone to view lessons of published courses" ON public.course_lessons;

-- Create a restricted public policy that only shows free lessons of published courses
CREATE POLICY "Public can view free lessons of published courses"
ON public.course_lessons
FOR SELECT
TO public
USING (
  is_free = true
  AND EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_lessons.course_id
    AND courses.is_published = true
  )
);
