-- Replace broad SELECT with a narrower one that only allows reading known assets,
-- so the bucket can't be enumerated.
DROP POLICY IF EXISTS "Public assets are readable by everyone" ON storage.objects;

CREATE POLICY "Public assets: read whitelisted files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'public-assets'
  AND name IN ('icon-128.png')
);
