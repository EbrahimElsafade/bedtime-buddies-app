
-- Update the stories table to support multilingual story_audio as JSONB
ALTER TABLE public.stories 
ALTER COLUMN story_audio TYPE jsonb USING story_audio::jsonb;

-- Set default value for story_audio to empty JSON object
ALTER TABLE public.stories 
ALTER COLUMN story_audio SET DEFAULT '{}'::jsonb;
