-- Create and configure the theftsnapshots storage bucket
-- This will fix the "Bucket not found" error

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'theftsnapshots',
  'theftsnapshots',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to upload theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update theftsnapshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete theftsnapshots" ON storage.objects;

-- Create comprehensive storage policies
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

CREATE POLICY "Allow anonymous users to upload theftsnapshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'theftsnapshots');

CREATE POLICY "Allow authenticated users to update theftsnapshots"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'theftsnapshots');

CREATE POLICY "Allow authenticated users to delete theftsnapshots"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'theftsnapshots');

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'theftsnapshots'; 