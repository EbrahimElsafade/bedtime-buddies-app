-- Fix premium content exposure by updating RLS policies to check subscription status

-- 1. Fix story_sections RLS policy to check subscription
DROP POLICY IF EXISTS "Public can view sections of published stories" ON story_sections;

CREATE POLICY "Users can view story sections based on subscription"
ON story_sections FOR SELECT
USING (
  story_id IN (
    SELECT s.id FROM stories s
    WHERE s.is_published = true
    AND (
      s.is_free = true
      OR (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.is_premium = true
          AND (p.subscription_end IS NULL OR p.subscription_end > now())
        )
      )
    )
  )
);

-- 2. Fix scene_translations RLS policy to check subscription
DROP POLICY IF EXISTS "Public can view translations of published stories" ON scene_translations;

CREATE POLICY "Users can view translations based on subscription"
ON scene_translations FOR SELECT
USING (
  scene_id IN (
    SELECT sc.id FROM story_scenes sc
    JOIN stories s ON s.id = sc.story_id
    WHERE s.is_published = true
    AND (
      s.is_free = true
      OR (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.is_premium = true
          AND (p.subscription_end IS NULL OR p.subscription_end > now())
        )
      )
    )
  )
);

-- 3. Fix course_lessons RLS policy to check both lesson-level and course-level free status plus subscription
DROP POLICY IF EXISTS "Users can view lessons of free courses or premium courses if su" ON course_lessons;

CREATE POLICY "Users can view lessons based on subscription"
ON course_lessons FOR SELECT
USING (
  -- Individual lesson is free
  is_free = true
  OR
  -- Or course is free
  course_id IN (SELECT id FROM courses WHERE is_free = true AND is_published = true)
  OR
  -- Or user has premium subscription
  (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_premium = true
      AND (p.subscription_end IS NULL OR p.subscription_end > now())
    )
  )
);