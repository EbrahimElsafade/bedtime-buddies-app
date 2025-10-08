-- Drop the insecure policy that allows public access to all published course lessons
DROP POLICY IF EXISTS "Public can view lessons of published courses" ON course_lessons;

-- Create a secure policy that checks if the course is free OR user has premium access
CREATE POLICY "Users can view lessons of free courses or premium courses if subscribed"
ON course_lessons
FOR SELECT
USING (
  -- Allow if course is published AND (course is free OR user has valid premium subscription)
  course_id IN (
    SELECT courses.id
    FROM courses
    WHERE courses.is_published = true
      AND (
        courses.is_free = true
        OR (
          auth.uid() IN (
            SELECT profiles.id
            FROM profiles
            WHERE profiles.is_premium = true
              AND (profiles.subscription_end IS NULL OR profiles.subscription_end > now())
          )
        )
      )
  )
);