-- =====================================================
-- 카테고리 추가 에러 해결 스크립트
-- =====================================================

-- 1. label_en (영문 이름) 컬럼의 NOT NULL 제약조건 제거
-- 입력창을 없앴으므로 이제 선택 사항이 되어야 합니다.
ALTER TABLE categories ALTER COLUMN label_en DROP NOT NULL;

-- 2. 만약 label_en이 비어있으면 value 값으로 채우기 (기존 데이터 보정)
UPDATE categories SET label_en = UPPER(value) WHERE label_en IS NULL;

-- 3. 권한 문제 방지를 위한 RLS 정책 재설정 (확실하게!)
DROP POLICY IF EXISTS "Anyone can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

-- 모든 사용자(익명 포함)가 추가/수정/삭제 가능하도록 허용 (개발용)
CREATE POLICY "Anyone can manage categories" ON categories
    FOR ALL USING (true);

-- 4. 확인용 메시지
SELECT 'Success! label_en is now optional and permissions are fixed.' as result;
