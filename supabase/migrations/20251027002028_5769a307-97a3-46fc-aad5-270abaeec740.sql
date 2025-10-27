-- Add video field to story_sections table
ALTER TABLE story_sections
ADD COLUMN video text;

COMMENT ON COLUMN story_sections.video IS 'HLS video URL for the section (replaces static image with video)';