-- 1. Create system_logs table
create table if not exists public.system_logs (
    id uuid default gen_random_uuid() primary key,
    event_type text not null, -- 'AUTH', 'ORDER', 'SYSTEM'
    event_code text not null, -- 'SYNC', 'LIVE', 'SEC', 'SYS' displayed in UI
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Admin only)
alter table public.system_logs enable row level security;

create policy "Admins can view system logs"
on public.system_logs for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- 2. Trigger function for new orders
create or replace function public.log_new_order()
returns trigger as $$
begin
    insert into public.system_logs (event_type, event_code, message)
    values ('ORDER', 'LIVE', '주문 수신됨 [' || substring(NEW.id::text, 1, 8) || '] - 처리 프로세스 시작');
    return NEW;
end;
$$ language plpgsql security definer;

-- 3. Trigger for orders table
drop trigger if exists on_new_order on public.orders;
create trigger on_new_order
after insert on public.orders
for each row execute procedure public.log_new_order();

-- 4. Trigger function for new users
create or replace function public.log_new_user()
returns trigger as $$
begin
    insert into public.system_logs (event_type, event_code, message)
    values ('AUTH', 'SYNC', '새 계정 생성됨 [' || substring(coalesce(NEW.email, 'unknown'), 1, 4) || '***] - 프로필 동기화 완료');
    return NEW;
end;
$$ language plpgsql security definer;

-- 5. Trigger for profiles table
drop trigger if exists on_new_user on public.profiles;
create trigger on_new_user
after insert on public.profiles
for each row execute procedure public.log_new_user();

-- 6. Insert initial dummy logs
insert into public.system_logs (event_type, event_code, message) values
('SYSTEM', 'SYS', '메인프레임 업링크 활성화됨'),
('SECURITY', 'SEC', '보안 취약점 스캔 완료: 위협 없음'),
('SYSTEM', 'LIVE', '실시간 트랜잭션 모니터링 가동');
