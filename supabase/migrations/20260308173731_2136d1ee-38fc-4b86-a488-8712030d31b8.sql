
-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'To Do',
  deadline TEXT NOT NULL DEFAULT 'Next Week',
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'next',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed per PLANNING.md: "No user authentication in v1"
ALTER TABLE public.reminders DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Allow public access to screenshots bucket
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'screenshots');
CREATE POLICY "Public insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'screenshots');
CREATE POLICY "Public delete access" ON storage.objects FOR DELETE USING (bucket_id = 'screenshots');
