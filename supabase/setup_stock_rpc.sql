-- =====================================================
-- 재고 관리 RPC 함수 (주문 연동용)
-- =====================================================

-- 1. 재고 차감 함수
-- 사용법: supabase.rpc('decrease_stock', { p_id: '상품UUID', qty: 1 })
-- 반환값: 성공 시 true, 재고 부족 시 false
CREATE OR REPLACE FUNCTION decrease_stock(p_id UUID, qty INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INT;
BEGIN
  -- 현재 재고 확인 및 Row Lock 설정
  SELECT stock INTO current_stock FROM products WHERE id = p_id FOR UPDATE;
  
  -- 재고가 없거나 부족하면 false 반환
  IF current_stock IS NULL OR current_stock < qty THEN
    RETURN FALSE;
  END IF;

  -- 재고 차감
  UPDATE products SET stock = stock - qty WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- 2. 재고 증가 함수 (주문 취소 시 복구용)
-- 사용법: supabase.rpc('increase_stock', { p_id: '상품UUID', qty: 1 })
CREATE OR REPLACE FUNCTION increase_stock(p_id UUID, qty INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 재고 증가 (음수 재고 방지 로직은 필요 없음, 복구이므로)
  UPDATE products SET stock = stock + qty WHERE id = p_id;
END;
$$;

SELECT 'Stock management functions created successfully!' as result;
