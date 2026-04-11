-- Photo Gallery: ensure photo_urls column exists on profiles
-- (It was already defined in 001_create_tables.sql as TEXT[],
--  but this migration also sets up the Storage bucket and policies.)

-- Make sure photo_urls column exists (idempotent)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- ─────────────────────────────────────────────────────────
-- Supabase Storage bucket + policies
-- Run these in the Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────

-- 1. Create the storage bucket (public reads, auth writes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to their own folder
CREATE POLICY IF NOT EXISTS "Authenticated users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- 3. Allow authenticated users to delete their own photos
CREATE POLICY IF NOT EXISTS "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- 4. Allow public reads (bucket is already public, but be explicit)
CREATE POLICY IF NOT EXISTS "Public read access for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
