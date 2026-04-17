alter table public.notification_preferences
  add column if not exists email_due_tomorrow boolean not null default true,
  add column if not exists email_due_today boolean not null default true;