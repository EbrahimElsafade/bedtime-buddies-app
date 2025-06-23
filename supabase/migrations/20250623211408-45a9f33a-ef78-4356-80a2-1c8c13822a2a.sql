
-- Ensure the admin-content bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-content',
  'admin-content', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for admin-content bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to admin-content bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update admin-content bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from admin-content bucket" ON storage.objects;

-- Create policy to allow public read access specifically to story-covers folder
CREATE POLICY "Public read access for story-covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-content' AND (storage.foldername(name))[1] = 'story-covers');

-- Create policy to allow authenticated users to upload to story-covers folder
CREATE POLICY "Authenticated users can upload to story-covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update story-covers files
CREATE POLICY "Authenticated users can update story-covers"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete story-covers files
CREATE POLICY "Authenticated users can delete story-covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND auth.role() = 'authenticated'
);
