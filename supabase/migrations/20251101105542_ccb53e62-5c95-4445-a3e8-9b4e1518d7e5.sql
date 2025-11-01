-- Fix critical storage policy conflict
-- Drop all permissive policies that allow any authenticated user to access admin-content bucket
-- This fixes the security vulnerability where non-admin users could upload, modify, or delete admin content

-- Drop INSERT policies (3)
DROP POLICY IF EXISTS "Authenticated users can upload to story-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to story-voices" ON storage.objects;

-- Drop UPDATE policies (3)
DROP POLICY IF EXISTS "Authenticated users can update story-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update story-voices" ON storage.objects;

-- Drop DELETE policies (3)
DROP POLICY IF EXISTS "Authenticated users can delete story-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete story-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete story-voices" ON storage.objects;

-- After this migration, only admin-only policies remain:
-- ✅ "Only admins can upload content" (INSERT with admin check)
-- ✅ "Only admins can update content" (UPDATE with admin check)
-- ✅ "Only admins can delete content" (DELETE with admin check)
-- ✅ Public SELECT policies (intentional for content delivery)