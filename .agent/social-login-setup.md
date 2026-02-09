# 소셜 로그인 설정 완료 기록

## 📅 작업 일시

- **작업 기간**: 2026-02-02 ~ 2026-02-03
- **완료 상태**: ✅ 모든 소셜 로그인 정상 작동

---

## ✅ 완료된 소셜 로그인

### 1. 구글 로그인

- **Client ID**: `959449204880-qbema57jjs0dhpgvcctmfelakq35h6vh.apps.googleusercontent.com`
- **설정 위치**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Redirect URI**:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://secondface-mj.com/api/auth/callback/google`
  - `https://www.secondface-mj.com/api/auth/callback/google` ⭐

### 2. 네이버 로그인

- **Client ID**: `IZfvZCRuWkg2ux4iRBGH`
- **설정 위치**: [Naver Developers](https://developers.naver.com/apps)
- **Callback URL**:
  - `http://localhost:3000/api/auth/callback/naver`
  - `https://secondface-mj.com/api/auth/callback/naver`
  - `https://www.secondface-mj.com/api/auth/callback/naver` ⭐

### 3. 카카오 로그인 ✨ NEW

- **App ID**: `1377638`
- **REST API 키**: `12c68886fba7d6d66a56b65993ecf2f9`
- **Client Secret**: `PlhRGeA74NkxTviwBlpCnY5rRfeNAc4U`
- **설정 위치**: [Kakao Developers](https://developers.kakao.com/)
- **Redirect URI**:
  - `http://localhost:3000/api/auth/callback/kakao`
  - `https://secondface-mj.com/api/auth/callback/kakao`
  - `https://www.secondface-mj.com/api/auth/callback/kakao` ⭐

---

## 🔑 환경 변수 (Vercel Production)

```env
# Google OAuth
GOOGLE_CLIENT_ID=959449204880-qbema57jjs0dhpgvcctmfelakq35h6vh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[Encrypted]

# Naver OAuth
NAVER_CLIENT_ID=IZfvZCRuWkg2ux4iRBGH
NAVER_CLIENT_SECRET=4YgGG8cJd0

# Kakao OAuth
KAKAO_CLIENT_ID=12c68886fba7d6d66a56b65993ecf2f9
KAKAO_CLIENT_SECRET=PlhRGeA74NkxTviwBlpCnY5rRfeNAc4U

# NextAuth
NEXTAUTH_URL=https://secondface-mj.com
NEXTAUTH_SECRET=[설정됨]
```

---

## 🐛 해결된 주요 문제

### 1. redirect_uri_mismatch 에러

**원인**: NextAuth가 `www.secondface-mj.com`으로 callback URL을 생성하는데, 개발자 콘솔에는 `www` 없는 주소만 등록되어 있었음

**해결**: 모든 provider의 개발자 콘솔에 `www` 포함 주소도 추가 등록

- `https://www.secondface-mj.com/api/auth/callback/{provider}`

### 2. 환경 변수 줄바꿈 문제

**원인**: Vercel 환경 변수 `NEXTAUTH_URL`에 `\r\n` (줄바꿈 문자) 포함

**해결**:

1. Vercel Web UI에서 수동으로 정확히 재입력
2. `next.config.ts`에 모든 환경 변수 trim 처리 추가
3. NextAuth provider 설정에 `.trim()` 적용

---

## 📝 카카오 로그인 설정 상세 가이드

### 1. 카카오 개발자 콘솔 설정

#### 1-1. 앱 생성

1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. [내 애플리케이션] > [애플리케이션 추가하기]
3. 앱 이름: `secondface`

#### 1-2. 플랫폼 키 확인

- 왼쪽 메뉴: [앱] > [플랫폼 키]
- **REST API 키** 복사 → `KAKAO_CLIENT_ID`

#### 1-3. Redirect URI 등록

- 왼쪽 메뉴: [앱] > [플랫폼 키]
- 아래로 스크롤: **카카오 로그인 리다이렉트 URI** 섹션
- `+` 버튼으로 3개 URI 등록:

  ```
  http://localhost:3000/api/auth/callback/kakao
  https://secondface-mj.com/api/auth/callback/kakao
  https://www.secondface-mj.com/api/auth/callback/kakao
  ```

#### 1-4. 카카오 로그인 활성화

- 왼쪽 메뉴: [제품 설정] > [카카오 로그인] > [일반]
- **사용 설정**: ON

#### 1-5. Client Secret 생성

- 같은 [플랫폼 키] 페이지 아래로 스크롤
- **클라이언트 시크릿** 섹션:
  - [코드 생성] 클릭
  - 생성된 코드 복사 → `KAKAO_CLIENT_SECRET`
  - **활성화 상태**: ON

#### 1-6. 동의 항목 설정

- 왼쪽 메뉴: [제품 설정] > [카카오 로그인] > [동의항목]
- 필수 동의 항목:
  - 프로필 정보 (닉네임)
  - 카카오계정 (이메일)

---

## 🚀 코드 수정 사항

### next.config.ts

환경 변수 trim 처리 추가:

```typescript
// Trim all environment variables to remove hidden whitespace/newlines
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.trim();
}
if (process.env.GOOGLE_CLIENT_ID) {
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID.trim();
}
// ... (모든 OAuth 환경 변수)
```

### src/app/api/auth/[...nextauth]/route.ts

1. Provider 설정에 `.trim()` 적용:

```typescript
GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || "",
}),
```

1. `useSecureCookies` 설정 추가:

```typescript
export const authOptions: NextAuthOptions = {
    // ...
    useSecureCookies: process.env.NODE_ENV === "production",
};
```

---

## ✅ 테스트 완료

### 로컬 환경 (localhost:3000)

- ✅ 구글 로그인
- ✅ 네이버 로그인
- ✅ 카카오 로그인

### 프로덕션 환경 (secondface-mj.com)

- ✅ 구글 로그인
- ✅ 네이버 로그인
- ✅ 카카오 로그인

---

## 📌 중요 참고사항

### www 서브도메인 이슈

- NextAuth가 자동으로 `www.secondface-mj.com`으로 callback URL 생성
- 반드시 **모든 OAuth provider**에 `www` 포함 주소 등록 필요

### 환경 변수 관리

- Vercel CLI로 추가 시 줄바꿈 문자(`\r\n`) 들어갈 수 있음
- 가능하면 **Vercel Web UI**에서 수동 입력 권장
- 또는 `echo -n` 명령어로 줄바꿈 없이 추가

### 디버깅 방법

1. `/api/auth/providers` 접속하여 provider 설정 확인
2. 브라우저 개발자 도구 > Network 탭에서 실제 redirect_uri 확인
3. 환경 변수 디버그 API 생성하여 값 점검 (배포 후 삭제)

---

## 📅 변경 이력

- **2026-02-02**: 구글, 네이버 로그인 설정 완료
- **2026-02-03**: 카카오 로그인 설정 완료 ✨
