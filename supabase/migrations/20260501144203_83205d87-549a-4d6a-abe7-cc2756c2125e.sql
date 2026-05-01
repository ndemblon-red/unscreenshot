
-- Remove orphan reminders (invisible to all users via RLS, no recovery path)
DELETE FROM public.reminders WHERE user_id IS NULL;

-- Enforce ownership at the schema level
ALTER TABLE public.reminders ALTER COLUMN user_id SET NOT NULL;
