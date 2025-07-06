
-- Update existing stories to use the new categories
-- Map old categories to new ones with Bedtime -> jobs
UPDATE public.stories 
SET category = CASE 
  WHEN category = 'Bedtime' THEN 'jobs'
  WHEN category IN ('Adventure', 'Educational') THEN 'daily'
  WHEN category IN ('Animals', 'Fantasy') THEN 'food'
  ELSE 'daily'  -- default fallback
END
WHERE category NOT IN ('daily', 'food', 'jobs', 'religion');

-- Update existing stories to use the new language codes
-- Convert old language format to new format
UPDATE public.stories 
SET languages = CASE 
  WHEN 'English' = ANY(languages) OR 'en' = ANY(languages) THEN ARRAY['en']
  WHEN 'Arabic' = ANY(languages) OR 'ar' = ANY(languages) THEN ARRAY['ar-eg']
  WHEN 'French' = ANY(languages) OR 'fr' = ANY(languages) THEN ARRAY['en'] -- fallback to English
  ELSE ARRAY['en']  -- default fallback to English
END
WHERE NOT (languages <@ ARRAY['en', 'ar-eg', 'ar-fos7a']);

-- Also update any story sections that might have old language keys in their texts/voices JSON
UPDATE public.story_sections 
SET 
  texts = CASE 
    WHEN texts ? 'English' THEN (texts - 'English') || jsonb_build_object('en', texts->>'English')
    WHEN texts ? 'Arabic' THEN (texts - 'Arabic') || jsonb_build_object('ar-eg', texts->>'Arabic')
    ELSE texts
  END,
  voices = CASE 
    WHEN voices ? 'English' THEN (voices - 'English') || jsonb_build_object('en', voices->>'English')
    WHEN voices ? 'Arabic' THEN (voices - 'Arabic') || jsonb_build_object('ar-eg', voices->>'Arabic')
    ELSE voices
  END
WHERE texts ? 'English' OR texts ? 'Arabic' OR voices ? 'English' OR voices ? 'Arabic';
