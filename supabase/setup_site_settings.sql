-- Create site_settings table if it doesn't exist
create table if not exists public.site_settings (
  id text primary key,
  site_name text default 'SecondFace',
  notice_popup boolean default false,
  notice_title text default '',
  notice_content text default '',
  notice_image text default '',
  maintenance_mode boolean default false,
  updated_at timestamp with time zone default now()
);

-- Insert default row if not exists
insert into public.site_settings (id, site_name)
values ('main', 'SecondFace')
on conflict (id) do nothing;
