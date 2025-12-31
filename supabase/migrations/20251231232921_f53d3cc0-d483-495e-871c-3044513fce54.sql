-- Fix storage policies: Restrict story-covers management to editors/admins only
DROP POLICY IF EXISTS "Authenticated users can upload to story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete story-covers" ON storage.objects;

-- Create new policies for story-covers that require editor/admin role
CREATE POLICY "Editors can upload story-covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can update story-covers"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can delete story-covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-covers'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

-- Fix storage policies for story-audio folder
DROP POLICY IF EXISTS "Authenticated users can upload story audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update story audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete story audio" ON storage.objects;

CREATE POLICY "Editors can upload story audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can update story audio"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can delete story audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-audio'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

-- Fix storage policies for story-voices folder
DROP POLICY IF EXISTS "Authenticated users can upload story voices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update story voices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete story voices" ON storage.objects;

CREATE POLICY "Editors can upload story voices"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can update story voices"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

CREATE POLICY "Editors can delete story voices"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-content' 
  AND (storage.foldername(name))[1] = 'story-voices'
  AND public.has_any_role(auth.uid(), ARRAY['editor', 'admin']::public.app_role[])
);

-- Fix inconsistent RLS: Update scene_translations to use has_premium_access() function
DROP POLICY IF EXISTS "Users can view translations based on subscription" ON scene_translations;

CREATE POLICY "Users can view translations based on subscription"
ON scene_translations FOR SELECT
USING (
  scene_id IN (
    SELECT sc.id FROM story_scenes sc
    JOIN stories s ON s.id = sc.story_id
    WHERE s.is_published = true
    AND (
      s.is_free = true
      OR (auth.uid() IS NOT NULL AND public.has_premium_access(auth.uid()))
    )
  )
);