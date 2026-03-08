
-- Enable RLS but allow all access (no auth in v1)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
