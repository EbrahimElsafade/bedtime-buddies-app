-- Add transcoding status tracking to story_sections
ALTER TABLE story_sections 
ADD COLUMN video_status text DEFAULT 'pending' CHECK (video_status IN ('pending', 'transcoding', 'completed', 'failed')),
ADD COLUMN video_original text,
ADD COLUMN transcoding_progress integer DEFAULT 0,
ADD COLUMN transcoding_error text;