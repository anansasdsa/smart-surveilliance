-- Fix storage bucket policies for theftsnapshots
-- This allows public read access to images in the theft alert log

-- First, make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('theftsnapshots', 'theftsnapshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow public read access to theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to snapshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload snapshots" ON storage.objects;

-- Create new storage policies that allow public read access
CREATE POLICY "Allow public read access to theftsnapshots"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'theftsnapshots');

CREATE POLICY "Allow authenticated users to upload theftsnapshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'theftsnapshots' AND
    auth.role() = 'authenticated'
  );

-- Also allow anonymous users to upload (for backend integration)
CREATE POLICY "Allow anonymous users to upload theftsnapshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'theftsnapshots');

-- Allow updates to existing files
CREATE POLICY "Allow authenticated users to update theftsnapshots"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'theftsnapshots');

-- Allow deletes (optional)
CREATE POLICY "Allow authenticated users to delete theftsnapshots"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'theftsnapshots'); 