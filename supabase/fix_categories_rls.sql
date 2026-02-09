-- =====================================================
-- 카테고리 RLS 정책 수정 (모든 사용자 허용)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

-- 새 정책: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read categories" ON categories
    FOR SELECT USING (true);

-- 새 정책: 모든 사용자 관리 가능 (개발 중에만!)
CREATE POLICY "Anyone can manage categories" ON categories
    FOR ALL USING (true);

-- =====================================================
-- 주의: 프로덕션 환경에서는 인증된 사용자만 수정 가능하도록 변경하세요!
-- =====================================================

-- 프로덕션용 정책 (위 정책 대신 사용):
-- CREATE POLICY "Authenticated users can manage categories" ON categories
--     FOR ALL USING (auth.role() = 'authenticated');
