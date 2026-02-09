-- =====================================================
-- Profiles 테이블 권한 문제 해결 (NextAuth 연동용)
-- =====================================================

-- 문제 상황: NextAuth 로그인 시 Supabase Auth 세션이 없어서 RLS 정책에 의해 Insert가 거부됨.
-- 해결책: profiles 테이블에 대해 모든 접근(Insert/Update/Select)을 허용하는 정책으로 변경.

-- 1. 기존의 엄격한 정책 제거 (충돌 방지)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for profiles" ON public.profiles;

-- 2. 모든 접근 허용 정책 생성 (읽기, 쓰기, 수정, 삭제 모두 허용)
-- NextAuth 서버 측 코드에서 자유롭게 DB를 조작할 수 있게 됩니다.
CREATE POLICY "Enable all access for profiles"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

SELECT 'Profiles table RLS policy updated to allow all access! Try logging in again.' as result;
