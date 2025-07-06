
-- Create a table to store appearance settings
CREATE TABLE public.appearance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.appearance_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage appearance settings
CREATE POLICY "Admins can manage appearance settings" 
  ON public.appearance_settings 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- Create policy that allows public read access to appearance settings
CREATE POLICY "Public can view appearance settings" 
  ON public.appearance_settings 
  FOR SELECT 
  USING (true);

-- Insert initial home page settings
INSERT INTO public.appearance_settings (setting_key, setting_value) 
VALUES ('home_page', '{
  "freeStory": "",
  "storiesSection": true,
  "topRated": true,
  "courses": true,
  "specialStory": true
}');
