
-- Create story_sections table to store section data
CREATE TABLE public.story_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  section_order INTEGER NOT NULL,
  image TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_section_translations table for multi-language content
CREATE TABLE public.story_section_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL,
  language TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_id, language)
);

-- Add foreign key constraints
ALTER TABLE public.story_sections 
ADD CONSTRAINT fk_story_sections_story_id 
FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;

ALTER TABLE public.story_section_translations 
ADD CONSTRAINT fk_story_section_translations_section_id 
FOREIGN KEY (section_id) REFERENCES public.story_sections(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.story_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_section_translations ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for story_section_translations
CREATE POLICY "Admins can manage all section translations" 
  ON public.story_section_translations 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Public can view translations of published story sections" 
  ON public.story_section_translations 
  FOR SELECT 
  USING (section_id IN (
    SELECT story_sections.id FROM story_sections 
    WHERE story_sections.story_id IN (
      SELECT stories.id FROM stories WHERE stories.is_published = true
    )
  ));
