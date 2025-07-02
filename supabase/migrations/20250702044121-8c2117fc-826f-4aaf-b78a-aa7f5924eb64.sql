
-- First, let's update the existing story_sections table to match the new structure
ALTER TABLE public.story_sections 
RENAME COLUMN section_order TO "order";

-- Update the story_section_translations table structure
ALTER TABLE public.story_section_translations 
DROP COLUMN text,
DROP COLUMN audio_url;

-- Add new columns to story_section_translations for the flattened structure
ALTER TABLE public.story_section_translations 
ADD COLUMN text_content TEXT,
ADD COLUMN voice_url TEXT;

-- Or alternatively, we can restructure completely by dropping and recreating
-- Drop existing tables and recreate with the new structure
DROP TABLE IF EXISTS public.story_section_translations CASCADE;
DROP TABLE IF EXISTS public.story_sections CASCADE;

-- Create new story_sections table
CREATE TABLE public.story_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  "order" INTEGER NOT NULL,
  image TEXT NULL,
  texts JSONB NOT NULL DEFAULT '{}',
  voices JSONB NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.story_sections 
ADD CONSTRAINT fk_story_sections_story_id 
FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.story_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for story_sections
CREATE POLICY "Admins can manage all story sections" 
  ON public.story_sections 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Public can view sections of published stories" 
  ON public.story_sections 
  FOR SELECT 
  USING (story_id IN (
    SELECT stories.id FROM stories WHERE stories.is_published = true
  ));
