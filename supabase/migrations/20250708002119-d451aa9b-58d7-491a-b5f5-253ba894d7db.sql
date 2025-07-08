
-- Add audio_mode column to stories table
ALTER TABLE public.stories 
ADD COLUMN audio_mode text DEFAULT 'per_section' CHECK (audio_mode IN ('per_section', 'single_story'));

-- Add a column to store the single story audio file
ALTER TABLE public.stories 
ADD COLUMN story_audio text;
