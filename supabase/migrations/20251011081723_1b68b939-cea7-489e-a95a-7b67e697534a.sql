-- Add instructor_user_id to link to profiles table
ALTER TABLE public.courses
ADD COLUMN instructor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add comment to explain the flexible instructor approach
COMMENT ON COLUMN public.courses.instructor_user_id IS 'Reference to a user profile if instructor is an existing user. If null, instructor data is stored in instructor_name/bio fields.';

-- Add index for better performance when querying by instructor
CREATE INDEX idx_courses_instructor_user_id ON public.courses(instructor_user_id);