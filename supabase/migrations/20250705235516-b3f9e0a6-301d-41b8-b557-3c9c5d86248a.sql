
-- Clear existing categories and insert new ones
DELETE FROM public.story_categories;

-- Insert the new categories
INSERT INTO public.story_categories (name) VALUES
  ('daily'),
  ('food'),
  ('jobs'),
  ('religion');
