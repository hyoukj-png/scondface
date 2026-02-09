-- =====================================================
-- 이메일이 달라도 계정을 연동하기 위한 매핑 컬럼 추가
-- =====================================================

-- 1. linked_accounts JSONB 컬럼 추가
-- 구조: { "kakao": "12345678", "google": "1029384..." }
-- 이메일이 바뀌어도 변하지 않는 '고유 회원번호(sub/id)'를 저장합니다.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linked_accounts JSONB DEFAULT '{}'::jsonb;

-- 2. 기존 사용자들의 데이터 마이그레이션 (선택 사항)
-- 이미 로그인했던 사용자들은 provider ID를 모르므로 비워두거나,
-- 다음 로그인 시 업데이트되도록 로직에서 처리합니다.

SELECT 'Added linked_accounts JSONB column successfully!' as result;
