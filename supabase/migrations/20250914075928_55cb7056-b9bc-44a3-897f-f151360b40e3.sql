-- Add instructor and learning objectives fields to courses table
ALTER TABLE public.courses 
ADD COLUMN learning_objectives TEXT[],
ADD COLUMN instructor_name TEXT,
ADD COLUMN instructor_bio TEXT,
ADD COLUMN instructor_avatar TEXT,
ADD COLUMN instructor_expertise TEXT[];