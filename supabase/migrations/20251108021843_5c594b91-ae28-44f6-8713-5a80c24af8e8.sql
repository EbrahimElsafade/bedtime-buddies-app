-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to view published courses" ON courses;

-- Create new policy that allows everyone (including anonymous users) to view published courses
CREATE POLICY "Allow everyone to view published courses"
ON courses
FOR SELECT
USING (is_published = true);

-- Update course_lessons policy to also allow anonymous users to see lessons
DROP POLICY IF EXISTS "Allow authenticated users to view lessons of published courses" ON course_lessons;

CREATE POLICY "Allow everyone to view lessons of published courses"
ON course_lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_lessons.course_id
    AND courses.is_published = true
  )
);