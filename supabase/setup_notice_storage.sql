-- 1. Create a bucket for notice images
insert into storage.buckets (id, name, public)
values ('notices', 'notices', true)
on conflict (id) do nothing;

-- 2. Allow public access to read images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'notices' );

-- 3. Allow authenticated users (admin) to upload/update/delete
create policy "Admin Full Access"
on storage.objects for all
using ( bucket_id = 'notices' )
with check ( bucket_id = 'notices' );
