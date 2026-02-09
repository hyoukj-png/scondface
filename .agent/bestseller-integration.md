# Best Sellers 동적 연동 구현

## 📅 작업 일시

- **작업일**: 2026-02-03
- **상태**: ✅ 완료

---

## 🎯 구현 내용

### **1. Product 타입 업데이트**

- `is_bestseller` 필드 추가 (`src/types/product.ts`)

### **2. 관리자 페이지 (ProductForm)**

- ✅ "Mark as Best Seller" 체크박스 추가
- ✅ 노란색 테마로 구분 (Featured는 파란색, Best Seller는 노란색)
- ✅ formData에 `is_bestseller` 포함
- ✅ 데이터베이스 저장 시 포함

### **3. BestSellerSlider 컴포넌트**

- ✅ Mock 데이터 제거
- ✅ Supabase에서 `is_bestseller = true`인 상품 가져오기
- ✅ 최대 10개까지 표시
- ✅ 이미지 소스를 `images[0]`로 변경
- ✅ 각 상품 클릭 시 `/shop/{product_id}` 링크
- ✅ Best Seller가 없을 때 안내 메시지 표시

### **4. 데이터베이스 (Supabase)**

- `is_bestseller` 컬럼 추가
- 인덱스 생성으로 빠른 쿼리

---

## 🔧 기술 상세

### Product 타입

```typescript
export interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    images?: string[];
    description?: string;
    category?: string;
    stock?: number;
    is_featured?: boolean;     // 메인 페이지 Hero
    is_bestseller?: boolean;   // Best Sellers 섹션
}
```

### BestSellerSlider 핵심 로직

```typescript
const [bestSellers, setBestSellers] = useState<Product[]>([]);

useEffect(() => {
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .limit(10);
    setBestSellers(data);
}, []);
```

### 데이터베이스 SQL

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
```

---

## 📝 사용 방법

### **관리자 작업:**

1. `/admin/products` 접속
2. 상품 추가/수정
3. **"Mark as Best Seller"** 체크
4. 저장

### **사용자 경험:**

1. 메인 페이지 접속
2. 아래로 스크롤 → "BEST SELLERS" 섹션
3. 자동 슬라이드로 상품 확인 (3초마다)
4. **카드 클릭** → 상품 상세 페이지

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **3D Coverflow 효과** | Swiper.js 사용 |
| **자동 슬라이드** | 3초마다 자동 전환 |
| **반응형** | 모바일/태블릿/데스크톱 대응 |
| **Hover 효과** | 이미지 확대, 회전, 그림자 |
| **링크 연동** | 각 카드 클릭 시 상품 페이지 이동 |
| **빈 상태 처리** | Best Seller 없을 때 안내 메시지 |

---

## 🚀 배포 전 체크리스트

- [x] Product 타입 업데이트
- [x] ProductForm에 Best Seller 체크박스 추가
- [x] BestSellerSlider Supabase 연동
- [x] 이미지 소스 수정
- [x] 상품 링크 연동
- [x] 빈 상태 UI 추가
- [ ] **Supabase SQL 실행** (아래 참조)
- [ ] 테스트: 관리자에서 Best Seller 선택
- [ ] 테스트: 메인 페이지에서 확인
- [ ] 테스트: 카드 클릭 → 상품 페이지 이동

---

## 🗄️ Supabase SQL 실행

**[Supabase Dashboard](https://app.supabase.com)에서 실행:**

```sql
-- is_bestseller 컬럼 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
```

---

## 🎨 UI 구분

| 항목 | 색상 | 아이콘 |
|------|------|--------|
| **Featured (Hero)** | 파란색 (Blue) | ⭐ |
| **Best Seller** | 노란색 (Yellow) | 🏆 |

---

## 📊 비교: Before vs After

### **Before:**

- ❌ Mock 데이터 사용
- ❌ 링크 없음
- ❌ 관리자에서 제어 불가

### **After:**

- ✅ 실제 데이터베이스 연동
- ✅ 상품 페이지 링크
- ✅ 관리자가 Best Seller 선택 가능
- ✅ 최대 10개까지 표시

---

## 🔮 향후 개선 사항

- [ ] Best Seller 순서 지정 (정렬 순서 필드 추가)
- [ ] 관리자 페이지에서 Best Seller 목록만 필터링
- [ ] Best Seller 배지 디자인 추가
- [ ] 판매량/조회수 기반 자동 Best Seller 선정

---

**모든 작업이 완료되었습니다!** 🎉
