
-- Create story_categories table
CREATE TABLE IF NOT EXISTS public.story_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_languages table  
CREATE TABLE IF NOT EXISTS public.story_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the categories you requested
INSERT INTO public.story_categories (name) VALUES
  ('daily'),
  ('food'),
  ('jobs'),
  ('religion')
ON CONFLICT (name) DO NOTHING;

-- Insert some default languages
INSERT INTO public.story_languages (code, name) VALUES
  ('en', 'English'),
  ('ar-eg', 'مصري'),
  ('ar-fos7a', 'فصحى'),
  ('fr', 'Français')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS on both tables
ALTER TABLE public.story_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_languages ENABLE ROW LEVEL SECURITY;

-- Create policies for story_categories
CREATE POLICY "Anyone can view categories" ON public.story_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.story_categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Create policies for story_languages
CREATE POLICY "Anyone can view languages" ON public.story_languages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage languages" ON public.story_languages
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
