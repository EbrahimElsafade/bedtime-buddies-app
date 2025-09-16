-- Add multilingual fields to course_lessons table
ALTER TABLE public.course_lessons 
ADD COLUMN title_en text,
ADD COLUMN title_ar text, 
ADD COLUMN title_fr text,
ADD COLUMN description_en text,
ADD COLUMN description_ar text,
ADD COLUMN description_fr text;

-- Update existing course_lessons to use the current title/description as English
UPDATE public.course_lessons 
SET title_en = title, description_en = description;

-- Add multilingual fields to course_categories table  
ALTER TABLE public.course_categories
ADD COLUMN name_en text,
ADD COLUMN name_ar text,
ADD COLUMN name_fr text,
ADD COLUMN description_en text,
ADD COLUMN description_ar text, 
ADD COLUMN description_fr text;

-- Update existing course_categories to use the current name as English
UPDATE public.course_categories 
SET name_en = name;

-- Add multilingual fields to courses table for instructor data
ALTER TABLE public.courses
ADD COLUMN instructor_name_en text,
ADD COLUMN instructor_name_ar text,
ADD COLUMN instructor_name_fr text, 
ADD COLUMN instructor_bio_en text,
ADD COLUMN instructor_bio_ar text,
ADD COLUMN instructor_bio_fr text;

-- Update existing courses to use current instructor data as English
UPDATE public.courses 
SET instructor_name_en = instructor_name, 
    instructor_bio_en = instructor_bio;