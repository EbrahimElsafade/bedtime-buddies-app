-- Add is_free column to course_lessons table
ALTER TABLE course_lessons 
ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

-- Add a comment explaining this column
COMMENT ON COLUMN course_lessons.is_free IS 'Whether this individual lesson is free, even if the overall course is paid';