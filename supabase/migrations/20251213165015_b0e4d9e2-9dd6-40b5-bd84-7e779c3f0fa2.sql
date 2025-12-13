-- Add total_duration column to courses table (stores total duration in seconds)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_duration integer DEFAULT 0;

-- Create user_content_progress table to track finished content
CREATE TABLE IF NOT EXISTS public.user_content_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('story', 'course')),
  content_id uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS on user_content_progress
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress" 
ON public.user_content_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress" 
ON public.user_content_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress" 
ON public.user_content_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to calculate course total duration from lessons
CREATE OR REPLACE FUNCTION public.calculate_course_duration(course_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(SUM(duration), 0)::integer
  FROM public.course_lessons
  WHERE course_id = course_uuid;
$$;

-- Create trigger function to update course total_duration when lessons change
CREATE OR REPLACE FUNCTION public.update_course_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.courses
    SET total_duration = public.calculate_course_duration(OLD.course_id)
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE public.courses
    SET total_duration = public.calculate_course_duration(NEW.course_id)
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger on course_lessons
DROP TRIGGER IF EXISTS update_course_duration_trigger ON public.course_lessons;
CREATE TRIGGER update_course_duration_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.course_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_course_duration();

-- Update existing courses with their total durations
UPDATE public.courses c
SET total_duration = (
  SELECT COALESCE(SUM(duration), 0)
  FROM public.course_lessons cl
  WHERE cl.course_id = c.id
);