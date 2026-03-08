
DROP POLICY IF EXISTS "Allow all access" ON public.reminders;
CREATE POLICY "Allow all access" ON public.reminders
FOR ALL
TO public
USING (true)
WITH CHECK (true);
