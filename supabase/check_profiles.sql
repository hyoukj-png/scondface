-- =====================================================
-- Profiles 테이블 데이터 확인 쿼리
-- =====================================================

-- 1. 전체 프로필 개수 확인
SELECT count(*) as total_profiles FROM public.profiles;

-- 2. 실제 데이터 샘플 확인 (상위 5개)
SELECT * FROM public.profiles LIMIT 5;

-- 3. auth.users 테이블 데이터 개수와 비교 (관리자만 실행 가능)
SELECT count(*) as total_auth_users FROM auth.users;
