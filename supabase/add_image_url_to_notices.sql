-- Add image_url column to notices table
alter table public.notices 
add column if not exists image_url text;
