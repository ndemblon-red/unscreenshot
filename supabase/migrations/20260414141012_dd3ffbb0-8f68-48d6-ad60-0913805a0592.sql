
ALTER TABLE public.notification_log ADD COLUMN read boolean NOT NULL DEFAULT false;

CREATE POLICY "Users can update own notifications"
ON public.notification_log FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
