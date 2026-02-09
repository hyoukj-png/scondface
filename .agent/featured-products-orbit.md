# 메인 페이지 Featured 상품 3D 궤도 회전 기능

## 📅 작업 일시

- **작업일**: 2026-02-03
- **상태**: ✅ 완료

---

## 🎯 구현된 기능

### 1. **관리자 페이지 - 메인 노출 설정**

- 상품 등록/수정 시 "Display on Main Page" 체크박스로 메인 노출 여부 선택
- 최대 3개까지 선택 가능

### 2. **메인 페이지 - 3D 궤도 회전 애니메이션**

- Featured 상품 3개가 원형 궤도를 따라 **20초**에 한 바퀴 회전
- 각 상품은 **120도 간격**으로 배치
- 이미지 자체도 반대 방향으로 회전 (더 역동적인 효과)
- 각 상품마다 **상하 떠오름 애니메이션** (0.5초씩 딜레이)

### 3. **인터랙션 효과**

- ✅ **마우스 올리면 회전 멈춤** → 상품 클릭 용이
- ✅ **마우스 벗어나면 다시 회전**
- ✅ **이미지 hover** → 1.1배 확대
- ✅ **상품명 배지** → hover 시 표시

### 4. **클릭 기능**

- 각 이미지 클릭 → 해당 상품 상세 페이지 이동 (`/shop/{product_id}`)

---

## 🔧 기술 구현

### Product 타입 (src/types/product.ts)

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
    is_featured?: boolean; // 메인 페이지 노출 여부
}
```

### 데이터베이스 (Supabase)

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
```

### Hero 컴포넌트 핵심 로직

**1. Featured 상품 가져오기:**

```typescript
const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
const [isRotating, setIsRotating] = useState(true);

useEffect(() => {
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(3);
    setFeaturedProducts(data);
}, []);
```

**2. 궤도 회전 애니메이션:**

```typescript
<motion.div
    key={product.id}
    animate={isRotating ? {
        rotate: [angle, angle + 360]  // 회전
    } : {
        rotate: angle  // 정지
    }}
    transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
    }}
>
```

**3. 마우스 인터랙션:**

```tsx
<div 
    onMouseEnter={() => setIsRotating(false)}
    onMouseLeave={() => setIsRotating(true)}
>
```

---

## 🎨 애니메이션 상세

| 요소 | 효과 | 시간 |
|------|------|------|
| 궤도 회전 | 시계 반대 방향 | 20초/바퀴 |
| 이미지 자체 회전 | 시계 방향 | 20초/바퀴 |
| 상하 떠오름 | -10px ~ 0px | 3초 (각 0.5초 딜레이) |
| 중앙 텍스트 | 크기 변화 (1 ~ 1.05) | 4초 |
| Hover 시 확대 | 1.1배 | 즉시 |

---

## 📝 사용 방법

### 관리자 작업

1. `/admin/products` 접속
2. 상품 추가/수정
3. **"Display on Main Page"** 체크
4. 저장

### 사용자 경험

1. 메인 페이지 접속
2. 오른쪽에 3개 상품이 궤도를 돌며 표시
3. **마우스 올리면** → 회전 멈춤, 상품명 표시
4. **이미지 클릭** → 상품 상세 페이지

---

## 🚀 최적화

- **Framer Motion** 사용으로 부드러운 60fps 애니메이션
- **CSS transform**으로 GPU 가속
- **Conditional rendering**: featured 상품 없으면 기본 이미지 표시
- **Index** 생성으로 빠른 DB 쿼리

---

## 🎯 향후 개선 가능 사항

- [ ] 관리자 페이지에서 3개 초과 선택 시 경고 메시지
- [ ] Featured 상품 순서 지정 기능
- [ ] 모바일에서는 회전 속도 조절 (성능 최적화)
- [ ] 터치 디바이스에서 swipe로 회전 제어

---

## ✅ 테스트 체크리스트

- [x] Featured 상품 3개 선택 가능
- [x] 메인 페이지에서 궤도 회전 표시
- [x] 마우스 hover 시 회전 멈춤
- [x] 이미지 클릭 시 상품 페이지 이동
- [x] Fallback 이미지 정상 작동
- [x] 모든 애니메이션 부드럽게 동작
