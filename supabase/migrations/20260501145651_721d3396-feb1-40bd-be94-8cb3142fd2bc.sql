
ALTER TABLE public.notification_log ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.notification_log ALTER COLUMN reminder_id SET NOT NULL;
ALTER TABLE public.reminder_shares ALTER COLUMN shared_by_user_id SET NOT NULL;
ALTER TABLE public.reminder_shares ALTER COLUMN reminder_id SET NOT NULL;
ALTER TABLE public.reminder_shares ALTER COLUMN recipient_email SET NOT NULL;
