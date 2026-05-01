
-- Drop the broad public SELECT on storage.objects for screenshots bucket if present
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Screenshots are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view screenshots" ON storage.objects;

-- Owners can list/select their own objects via authenticated API
CREATE POLICY "Owners can list own screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
