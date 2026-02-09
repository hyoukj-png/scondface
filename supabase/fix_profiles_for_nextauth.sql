-- =====================================================
-- NextAuth 연동을 위한 Profiles 테이블 수정
-- (Supabase Auth를 거치지 않는 NextAuth 로그인을 지원하기 위함)
-- =====================================================

-- 1. id 컬럼의 외래키 제약조건 제거 (auth.users 참조 해제)
-- NextAuth만 사용할 경우 auth.users에 데이터가 생성되지 않기 때문입니다.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. id 컬럼에 자동 생성 기본값 추가
-- NextAuth에서 id를 넘겨주지 않아도 자동으로 UUID가 생성되도록 합니다.
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. 필요한 컬럼 추가 (NextAuth 코드에서 사용 중인 provider 컬럼 등)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT;

-- 4. RLS 정책 수정 (인증되지 않은 NextAuth 세션에서도 insert 가능하도록)
-- Supabase 클라이언트(service role)를 사용하면 RLS 우회 가능하지만, 
-- 혹시 모를 권한 문제를 위해 anon키로도 insert 가능한 정책을 추가할 수 있습니다.
-- (하지만 현재 코드는 service role을 쓰고 있으므로 4번은 필수는 아닙니다. 생략.)

SELECT 'Profiles table updated for NextAuth!' as result;
