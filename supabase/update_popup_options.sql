-- Update site_settings for advanced popup options
alter table public.site_settings 
add column if not exists notice_type text default 'text', -- 'text' or 'image'
add column if not exists notice_link text default '';

-- Update existing row if needed
update public.site_settings set notice_type = 'text' where notice_type is null;
