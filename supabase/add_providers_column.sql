-- =====================================================
-- 다중 소셜 계정 연동 상태 저장을 위한 컬럼 추가
-- =====================================================

-- 1. connected_providers 컬럼 추가 (문자열 배열)
-- 예: ['google', 'kakao']
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS connected_providers TEXT[] DEFAULT '{}';

-- 2. 기존 provider 컬럼의 데이터를 connected_providers로 마이그레이션
-- (단일 provider로 로그인했던 기록을 배열로 변환)
UPDATE public.profiles 
SET connected_providers = ARRAY[provider] 
WHERE provider IS NOT NULL AND (connected_providers IS NULL OR connected_providers = '{}');

SELECT 'Added connected_providers column successfully!' as result;
