create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.notification_preferences
  add column if not exists timezone text not null default 'UTC';