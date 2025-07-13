
-- Update the admin-content bucket to allow audio file types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/gif',
  'audio/mpeg',
  'audio/mp3', 
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/m4a',
  'audio/aac'
]
WHERE id = 'admin-content';

-- Also create RLS policies for audio files (story-audio and story-voices folders)
CREATE POLICY "Public read access for story-audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-content' AND (storage.foldername(name))[1] = 'story-audio');

CREATE POLICY "Authenticated users can upload to story-audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update story-audio"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete story-audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND auth.role() = 'authenticated'
);

-- Policies for story-voices folder
CREATE POLICY "Public read access for story-voices"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-content' AND (storage.foldername(name))[1] = 'story-voices');

CREATE POLICY "Authenticated users can upload to story-voices"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update story-voices"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete story-voices"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND auth.role() = 'authenticated'
);
