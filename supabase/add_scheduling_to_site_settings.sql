-- Add start and end time columns to site_settings table
alter table public.site_settings 
add column if not exists notice_start_at timestamptz,
add column if not exists notice_end_at timestamptz;
