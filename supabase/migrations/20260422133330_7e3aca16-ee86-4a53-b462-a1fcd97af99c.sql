CREATE TABLE public.reminder_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX reminder_shares_unique_active
  ON public.reminder_shares (reminder_id, recipient_email)
  WHERE revoked_at IS NULL;

CREATE INDEX reminder_shares_reminder_id_active_idx
  ON public.reminder_shares (reminder_id)
  WHERE revoked_at IS NULL;

CREATE INDEX reminder_shares_shared_by_user_id_idx
  ON public.reminder_shares (shared_by_user_id);

ALTER TABLE public.reminder_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
ON public.reminder_shares
FOR SELECT
TO authenticated
USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can insert own shares"
ON public.reminder_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can update own shares"
ON public.reminder_shares
FOR UPDATE
TO authenticated
USING (auth.uid() = shared_by_user_id)
WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete own shares"
ON public.reminder_shares
FOR DELETE
TO authenticated
USING (auth.uid() = shared_by_user_id);