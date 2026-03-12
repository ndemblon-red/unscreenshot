
-- Add user_id column to reminders
ALTER TABLE public.reminders 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Allow all access" ON public.reminders;

-- Users can only see their own reminders
CREATE POLICY "Users can view own reminders"
ON public.reminders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own reminders
CREATE POLICY "Users can insert own reminders"
ON public.reminders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reminders
CREATE POLICY "Users can update own reminders"
ON public.reminders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reminders
CREATE POLICY "Users can delete own reminders"
ON public.reminders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
