-- Create course_categories table
CREATE TABLE public.course_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for course categories
CREATE POLICY "Admins can manage course categories" 
ON public.course_categories 
FOR ALL 
USING (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'::user_role));

CREATE POLICY "Anyone can view course categories" 
ON public.course_categories 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_categories_updated_at
  BEFORE UPDATE ON public.course_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.course_categories (name) VALUES 
  ('Language'),
  ('Math'),
  ('Science'),
  ('Arts'),
  ('Social');

-- Alter courses table to add new fields to match the new data structure
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS max_age INTEGER,
ADD COLUMN IF NOT EXISTS lessons INTEGER,
ADD COLUMN IF NOT EXISTS cover_image_path TEXT;

-- Add foreign key constraint for category_id
ALTER TABLE public.courses 
ADD CONSTRAINT courses_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.course_categories(id);

-- Update course_lessons table to match new structure  
ALTER TABLE public.course_lessons
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT,
ADD COLUMN IF NOT EXISTS lesson_order_new INTEGER;

-- Copy lesson_order to new column if it exists
UPDATE public.course_lessons 
SET lesson_order_new = lesson_order 
WHERE lesson_order IS NOT NULL;

-- Drop old lesson_order column and rename new one
ALTER TABLE public.course_lessons 
DROP COLUMN IF EXISTS lesson_order;

ALTER TABLE public.course_lessons 
RENAME COLUMN lesson_order_new TO lesson_order;

-- Make lesson_order not null with default
ALTER TABLE public.course_lessons 
ALTER COLUMN lesson_order SET NOT NULL,
ALTER COLUMN lesson_order SET DEFAULT 1;