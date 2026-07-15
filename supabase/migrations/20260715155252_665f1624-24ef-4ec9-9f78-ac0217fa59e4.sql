DROP POLICY IF EXISTS "Public can view free lessons of published courses" ON public.course_lessons;

CREATE POLICY "Public can view lessons of published courses"
ON public.course_lessons
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_lessons.course_id
      AND courses.is_published = true
  )
);