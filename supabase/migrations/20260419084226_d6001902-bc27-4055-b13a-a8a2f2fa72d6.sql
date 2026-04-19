-- Create a public bucket for static assets (e.g. email logo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for anyone
CREATE POLICY "Public assets are readable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public-assets');
