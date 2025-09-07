-- Create private video storage bucket for secure course content
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', false);

-- Create RLS policies for course videos bucket
CREATE POLICY "Authenticated users can view their accessible videos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if user has premium subscription
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE is_premium = true 
      AND (subscription_end IS NULL OR subscription_end > now())
    )
    OR
    -- Or if the video belongs to a free course
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM courses WHERE is_free = true
    )
  )
);

CREATE POLICY "Admins can manage all course videos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Add video_path column to course_lessons for secure storage paths
ALTER TABLE course_lessons ADD COLUMN video_path text;