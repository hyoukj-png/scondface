-- =====================================================
-- 카테고리 관리 테이블 생성
-- =====================================================

-- 1. categories 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    value TEXT NOT NULL UNIQUE,          -- 카테고리 값 (예: "sunglasses")
    label TEXT NOT NULL,                 -- 한글 이름 (예: "선글라스")
    label_en TEXT NOT NULL,             -- 영문 이름 (예: "SUNGLASSES")
    sort_order INTEGER DEFAULT 0,        -- 정렬 순서
    is_active BOOLEAN DEFAULT true,      -- 활성화 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 기본 카테고리 데이터 삽입
INSERT INTO categories (value, label, label_en, sort_order) VALUES
    ('sunglasses', '선글라스', 'SUNGLASSES', 1),
    ('frames', '안경테', 'FRAMES', 2),
    ('goggles', '고글', 'GOGGLES', 3)
ON CONFLICT (value) DO NOTHING;

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5. 정책: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read categories" ON categories
    FOR SELECT USING (true);

-- 6. 정책: 인증된 사용자만 수정 가능 (관리자 전용으로 나중에 변경 가능)
CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 완료! Supabase SQL Editor에서 위 코드를 실행하세요.
-- =====================================================
