-- Create course_favorites table for users to favorite courses
CREATE TABLE IF NOT EXISTS public.course_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.course_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for course_favorites
CREATE POLICY "Users can view their own course favorites"
ON public.course_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own course favorites"
ON public.course_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course favorites"
ON public.course_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_course_favorites_user_id ON public.course_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_course_favorites_course_id ON public.course_favorites(course_id);