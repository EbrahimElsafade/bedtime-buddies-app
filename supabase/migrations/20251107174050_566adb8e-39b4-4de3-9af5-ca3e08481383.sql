-- Update RLS policies to require authentication for viewing courses
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Users can view lessons based on subscription" ON course_lessons;

-- Only authenticated users can view published courses
CREATE POLICY "Authenticated users can view published courses"
ON courses
FOR SELECT
TO authenticated
USING (is_published = true);

-- Only authenticated users can view lessons (with subscription checks)
CREATE POLICY "Authenticated users can view lessons based on subscription"
ON course_lessons
FOR SELECT
TO authenticated
USING (
  is_free = true 
  OR (course_id IN (
    SELECT id FROM courses 
    WHERE is_free = true AND is_published = true
  ))
  OR (auth.uid() IS NOT NULL AND has_premium_access(auth.uid()))
);