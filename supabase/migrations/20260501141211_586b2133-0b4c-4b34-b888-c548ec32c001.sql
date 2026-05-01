
-- Drop the overly-permissive existing policies on the screenshots bucket
DROP POLICY IF EXISTS "Public insert access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Public SELECT stays as-is (needed for emails to render screenshots)
-- The "Public read access" policy is kept untouched.

-- INSERT: only authenticated users, only into their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: only authenticated users, only on files in their own folder
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: only authenticated users, only on files in their own folder
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
