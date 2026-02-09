-- =====================================================
-- 스토리지(Storage) 권한 해결 스크립트
-- =====================================================

-- 1. product-images 버킷이 없으면 생성 (이미 있으면 무시됨)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 스토리지 정책 초기화 (기존 정책 충돌 방지)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me liberty or give me death" ON storage.objects; -- 예전 정책 이름이 있을 경우 대비

-- 3. [개발용] 모든 사용자에게 모든 권한 허용 (읽기, 쓰기, 수정, 삭제)
-- 주의: 실제 서비스 배포 시에는 'authenticated' 역할로 제한하는 것이 좋습니다.
CREATE POLICY "Allow All Access" ON storage.objects
FOR ALL USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 4. 확인 메시지
SELECT 'Storage permissions fixed! You can now upload images.' as result;
