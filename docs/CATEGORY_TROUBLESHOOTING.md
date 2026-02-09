# 카테고리 관리 문제 해결 가이드

## ❌ "Failed to update category" 에러

### 1️⃣ Supabase 테이블 확인

**문제**: `categories` 테이블이 생성되지 않았을 수 있습니다.

**해결**:

1. Supabase 대시보드 접속
2. **Table Editor** 메뉴 클릭
3. `categories` 테이블이 있는지 확인
4. 없다면:
   - **SQL Editor** → **New Query**
   - `h:\secondface\supabase\categories_table.sql` 파일 내용 복사
   - 붙여넣기 후 **Run** 클릭

---

### 2️⃣ RLS (Row Level Security) 정책 확인

**문제**: Supabase RLS 정책이 업데이트를 허용하지 않을 수 있습니다.

**해결**:

1. Supabase 대시보드 → **Authentication** → **Policies**
2. `categories` 테이블 정책 확인
3. 다음 정책이 있는지 확인:

   ```sql
   "Authenticated users can manage categories"
   ```

4. 없다면 SQL Editor에서 다시 실행:

   ```sql
   CREATE POLICY "Authenticated users can manage categories" ON categories
       FOR ALL USING (auth.role() = 'authenticated');
   ```

---

### 3️⃣ 환경 변수 확인

**문제**: Supabase 연결 정보가 올바르지 않을 수 있습니다.

**해결**:
`.env.local` 파일 확인:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

값이 `your-project-url`로 되어 있다면 실제 Supabase 정보로 변경하세요!

---

### 4️⃣ API 엔드포인트 테스트

**브라우저 콘솔**에서 직접 테스트:

```javascript
// 카테고리 목록 조회
fetch('/api/categories').then(r => r.json()).then(console.log);

// 카테고리 수정 테스트
fetch('/api/categories', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'category-id-here',
    label: '새 이름'
  })
}).then(r => r.json()).then(console.log);
```

---

### 5️⃣ 개발자 도구 확인

1. **F12** 또는 **Ctrl+Shift+I** 로 개발자 도구 열기
2. **Console** 탭 확인
3. **Network** 탭에서:
   - `/api/categories` 요청 확인
   - **Status Code** 확인 (200이어야 함)
   - **Response** 탭에서 에러 메시지 확인

---

### 6️⃣ 개선된 UI 사용법

**인라인 편집 (새로운 방식)**:

1. ✏️ **연필 아이콘** 클릭
2. 입력 필드 표시됨
3. 새 이름 입력
4. **Enter** 키 또는 외부 클릭으로 저장
5. **ESC** 키로 취소

---

## 🔍 로그 확인

**터미널** (npm run dev가 실행 중인 곳)에서:

- API 요청 로그 확인
- Supabase 에러 메시지 확인

**브라우저 콘솔**에서:

- "API Error:" 로그 확인
- 에러 객체의 상세 정보 확인

---

## 💡 임시 해결책

Supabase 설정이 복잡하다면, 임시로 **로컬 상태 관리**로 전환할 수 있습니다.
(추후 Supabase 연결 후 데이터 동기화)

이 경우 별도 요청해주세요!

---

## ✅ 체크리스트

- [ ] Supabase 테이블 생성됨
- [ ] RLS 정책 활성화됨
- [ ] 환경 변수 설정 완료
- [ ] 로그인 상태 확인
- [ ] 브라우저 콘솔에 자세한 에러 확인
