-- Add multilingual learning objectives columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS learning_objectives_en text[],
ADD COLUMN IF NOT EXISTS learning_objectives_ar text[],
ADD COLUMN IF NOT EXISTS learning_objectives_fr text[];