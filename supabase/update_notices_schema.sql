-- 1. Add image_url column to notices table
alter table public.notices 
add column if not exists image_url text;

-- 2. Add content column if it doesn't exist (previously might have been missing in some views)
alter table public.notices
add column if not exists content text;

-- 3. Create function to increment notice read count
create or replace function increment_notice_read_count(notice_id int)
returns void as $$
begin
  update public.notices
  set read_count = read_count + 1
  where id = notice_id;
end;
$$ language plpgsql security definer;
