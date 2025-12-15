-- Drop the existing user_content_progress table to rebuild with proper structure
DROP TABLE IF EXISTS public.user_content_progress;

-- Create table to track individual section/lesson opens
CREATE TABLE public.user_section_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('story_section', 'course_lesson')),
  content_id UUID NOT NULL,
  parent_id UUID NOT NULL, -- story_id or course_id
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create table to track finished content (stories/courses)
CREATE TABLE public.user_finished_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'course')),
  content_id UUID NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Add gamification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_milestones INTEGER[] NOT NULL DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.user_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_finished_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_section_progress
CREATE POLICY "Users can view their own section progress"
ON public.user_section_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own section progress"
ON public.user_section_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own section progress"
ON public.user_section_progress FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_finished_content
CREATE POLICY "Users can view their own finished content"
ON public.user_finished_content FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finished content"
ON public.user_finished_content FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finished content"
ON public.user_finished_content FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_section_progress_user_id ON public.user_section_progress(user_id);
CREATE INDEX idx_user_section_progress_parent_id ON public.user_section_progress(parent_id);
CREATE INDEX idx_user_finished_content_user_id ON public.user_finished_content(user_id);

-- Function to check if a story is complete (all sections opened)
CREATE OR REPLACE FUNCTION public.check_story_completion(_user_id UUID, _story_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_sections INTEGER;
  opened_sections INTEGER;
BEGIN
  -- Get total sections for the story
  SELECT COUNT(*) INTO total_sections
  FROM public.story_sections
  WHERE story_id = _story_id;
  
  -- Get opened sections by user
  SELECT COUNT(*) INTO opened_sections
  FROM public.user_section_progress
  WHERE user_id = _user_id
    AND content_type = 'story_section'
    AND parent_id = _story_id;
  
  RETURN total_sections > 0 AND opened_sections >= total_sections;
END;
$$;

-- Function to check if a course is complete (all lessons opened)
CREATE OR REPLACE FUNCTION public.check_course_completion(_user_id UUID, _course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_lessons INTEGER;
  opened_lessons INTEGER;
BEGIN
  -- Get total lessons for the course
  SELECT COUNT(*) INTO total_lessons
  FROM public.course_lessons
  WHERE course_id = _course_id;
  
  -- Get opened lessons by user
  SELECT COUNT(*) INTO opened_lessons
  FROM public.user_section_progress
  WHERE user_id = _user_id
    AND content_type = 'course_lesson'
    AND parent_id = _course_id;
  
  RETURN total_lessons > 0 AND opened_lessons >= total_lessons;
END;
$$;

-- Function to record section/lesson open and check for completion
CREATE OR REPLACE FUNCTION public.record_content_progress(
  _user_id UUID,
  _content_type TEXT,
  _content_id UUID,
  _parent_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB := '{"newly_completed": false, "points_awarded": false}'::jsonb;
  is_complete BOOLEAN;
  parent_type TEXT;
  already_finished BOOLEAN;
BEGIN
  -- Insert section progress (ignore if already exists)
  INSERT INTO public.user_section_progress (user_id, content_type, content_id, parent_id)
  VALUES (_user_id, _content_type, _content_id, _parent_id)
  ON CONFLICT (user_id, content_type, content_id) DO NOTHING;
  
  -- Determine parent type
  IF _content_type = 'story_section' THEN
    parent_type := 'story';
    is_complete := public.check_story_completion(_user_id, _parent_id);
  ELSIF _content_type = 'course_lesson' THEN
    parent_type := 'course';
    is_complete := public.check_course_completion(_user_id, _parent_id);
  ELSE
    RETURN result;
  END IF;
  
  -- If complete, check if already marked as finished
  IF is_complete THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_finished_content
      WHERE user_id = _user_id
        AND content_type = parent_type
        AND content_id = _parent_id
    ) INTO already_finished;
    
    IF NOT already_finished THEN
      -- Mark as finished
      INSERT INTO public.user_finished_content (user_id, content_type, content_id)
      VALUES (_user_id, parent_type, _parent_id);
      
      -- Award 1 point
      UPDATE public.profiles
      SET total_points = total_points + 1,
          updated_at = now()
      WHERE id = _user_id;
      
      -- Update milestones
      PERFORM public.update_user_milestones(_user_id);
      
      result := '{"newly_completed": true, "points_awarded": true}'::jsonb;
    END IF;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to update user milestones based on total points
CREATE OR REPLACE FUNCTION public.update_user_milestones(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points INTEGER;
  new_milestones INTEGER[] := '{}';
  milestone_thresholds INTEGER[] := ARRAY[5, 10, 25, 50, 100];
  i INTEGER;
BEGIN
  -- Get current points
  SELECT total_points INTO current_points
  FROM public.profiles
  WHERE id = _user_id;
  
  -- Check each milestone threshold
  FOR i IN 1..array_length(milestone_thresholds, 1)
  LOOP
    IF current_points >= milestone_thresholds[i] THEN
      new_milestones := array_append(new_milestones, i);
    END IF;
  END LOOP;
  
  -- Update milestones
  UPDATE public.profiles
  SET unlocked_milestones = new_milestones,
      updated_at = now()
  WHERE id = _user_id;
END;
$$;

-- Function to get user gamification stats
CREATE OR REPLACE FUNCTION public.get_user_gamification_stats(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  user_points INTEGER;
  user_milestones INTEGER[];
BEGIN
  SELECT total_points, unlocked_milestones
  INTO user_points, user_milestones
  FROM public.profiles
  WHERE id = _user_id;
  
  result := jsonb_build_object(
    'total_points', COALESCE(user_points, 0),
    'unlocked_milestones', COALESCE(user_milestones, ARRAY[]::INTEGER[]),
    'milestone_thresholds', ARRAY[5, 10, 25, 50, 100]
  );
  
  RETURN result;
END;
$$;