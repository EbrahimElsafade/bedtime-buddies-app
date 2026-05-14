-- Allow anyone to view ALL lessons of published courses (including premium ones)
-- so the lessons list shows every lesson with locked indicators. Premium playback
-- access is still gated on the client via the subscription modal.
DROP POLICY IF EXISTS "Public can view all lessons of published courses" ON public.course_lessons;
CREATE POLICY "Public can view all lessons of published courses"
ON public.course_lessons
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_lessons.course_id
      AND courses.is_published = true
  )
);