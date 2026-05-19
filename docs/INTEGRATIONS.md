# 외부 연동 (Integrations)

카카오·구글·네이버 및 지도·주소 API 설정 체크리스트입니다. 환경 변수 전체 목록은 [ENV.md](./ENV.md)를 참고하세요.

## 요약 표

| 서비스 | 용도 | 프론트 env / 키 | 콘솔·등록 |
|--------|------|-----------------|-----------|
| 카카오 | SNS 로그인 | `NEXT_PUBLIC_KAKAO_REST_API_KEY(_TEST)` | 카카오 디벨로퍼스 → Redirect URI |
| 카카오 | 지도 (휴지통) | `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY(_TEST)` | 동일 앱 → Web 플랫폼 도메인 |
| 카카오 | 주소 검색 (서버) | `KAKAO_REST_API_KEY(_TEST)` | REST API 키 |
| 구글 | SNS 로그인 | 백엔드 `login-url` + redirect env | Google Cloud Console |
| 네이버 | SNS 로그인 | 백엔드 `login-url` + redirect env | 네이버 개발자센터 |

백엔드 OAuth 클라이언트 시크릿은 **백엔드 레포**에서 관리합니다. [BACKEND.md](./BACKEND.md)

### 키·콘솔 발급

- 카카오: [카카오 디벨로퍼스](https://developers.kakao.com/) — REST API 키, JavaScript 키, Redirect URI
- 구글: Google Cloud Console — OAuth 클라이언트
- 네이버: 네이버 개발자센터 — 로그인 API
- 콘솔 로그인·키 **실값**은 Public 레포·`docs/`에 두지 않습니다. 권한이 있는 협업자에게 **비공개**로 요청 ([SECURITY.md](./SECURITY.md)).

### OAuth Redirect URI (프로덕션 예시)

동일 패턴: `{origin}/{kakao|google|naver}/callback`

| 제공자 | `NEXT_PUBLIC_*_OAUTH_REDIRECT_URI` (prod) |
|--------|---------------------------------------------|
| 구글 | `https://dshelper.kr/google/callback` |
| 카카오 | `https://dshelper.kr/kakao/callback` |
| 네이버 | `https://dshelper.kr/naver/callback` |

테스트·로컬은 `*_TEST` 또는 `test.dshelper.kr` / `localhost:3000`에 맞게 동일 패턴으로 등록합니다.

---

## 카카오

### 1. 카카오 로그인 (개인)

| 항목 | 값 |
|------|-----|
| Authorize | `https://kauth.kakao.com/oauth/authorize` |
| 프론트 콜백 경로 | `/kakao/callback` |
| 코드 교환 | `POST /oauth/kakao/login` { code } |
| REST API 키 | authorize URL의 `client_id` (`buildKakaoAuthorizeUrl`) |

**Redirect URI (반드시 등록)**

| 환경 | URI |
|------|-----|
| 로컬 | `http://localhost:3000/kakao/callback` |
| 테스트 | `https://test.dshelper.kr/kakao/callback` |
| 프로덕션 | `https://dshelper.kr/kakao/callback` |

**레거시:** `/oauth/kakao/login` → `pages/oauth/kakao/login.tsx`가 `/kakao/callback`으로 리다이렉트. 콘솔에는 **최종 URI**만 등록해도 됩니다.

**테스트 호스트 동작:** `localhost`, `test.dshelper.kr`에서는 env 고정값보다 **현재 브라우저 origin + `/kakao/callback`**을 redirect로 씁니다 (`authUser.tsx`).

### 2. 카카오 지도 (JavaScript SDK)

| 항목 | 내용 |
|------|------|
| 로드 | `loadKakaoMapSdk.ts` — `dapi.kakao.com/.../sdk.js?appkey=...` |
| 사전 점검 | `GET /api/kakao-map-sdk-check` |
| 사용 화면 | `/trash-bin-list` |

**주의**

- **JavaScript 키**만 사용 (REST API 키 → 401)
- [플랫폼] → **Web** 사이트 도메인에 접속 URL 전체 등록 (포트 포함)
  - 예: `http://localhost:3000`, `https://test.dshelper.kr`, `https://dshelper.kr`

### 3. 카카오 로컬/주소 API (서버 프록시)

| 항목 | 내용 |
|------|------|
| Route | `pages/api/kakao-address.ts` |
| 키 | `KAKAO_REST_API_KEY` / `_TEST` (서버 전용) |
| 용도 | 도움 요청 등 주소·좌표 검색 |

브라우저에 REST 키를 직접 넣지 않고 Route를 거칩니다.

---

## 구글 로그인

| 항목 | 내용 |
|------|------|
| 시작 | `getGoogleOAuthStartUrl()` → `GET /oauth/google/login-url` |
| 콜백 | `/google/callback` → `POST /oauth/google/login` { code } |
| redirect 보정 | `getGoogleOAuthRedirectUri()` |

**Redirect URI 등록 (Google Cloud Console)**

| 환경 | URI |
|------|-----|
| 로컬 | `http://localhost:3000/google/callback` |
| 테스트 | `https://test.dshelper.kr/google/callback` |
| 프로덕션 | `https://dshelper.kr/google/callback` |

env: `NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI`, `NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI_TEST`

---

## 네이버 로그인

| 항목 | 내용 |
|------|------|
| 시작 | `getNaverOAuthStartUrl()` → `GET /oauth/naver/login-url` |
| 콜백 | `/naver/callback` → `POST /oauth/naver/login` { code, state } |
| redirect 보정 | `getNaverOAuthRedirectUri()` |

**Callback URL (네이버 개발자센터)**

| 환경 | URI |
|------|-----|
| 로컬 | `http://localhost:3000/naver/callback` |
| 테스트 | `https://test.dshelper.kr/naver/callback` |
| 프로덕션 | `https://dshelper.kr/naver/callback` |

---

## 호스트 ↔ env 매핑

`domainEnv.ts` — `TEST_HOSTS`: `test.dshelper.kr`, `localhost`, `127.0.0.1`

| 접속 | API | OAuth redirect | 지도 키 |
|------|-----|----------------|---------|
| dshelper.kr | `NEXT_PUBLIC_API_URL` | `*_URI` (prod) | `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY` |
| test / localhost | `NEXT_PUBLIC_TEST_API_URL` | `*_URI_TEST` 또는 origin 자동 | `*_KEY_TEST` |

---

## 새 환경(도메인) 추가 시

1. 카카오: Web 플랫폼 + Redirect URI + (지도) JavaScript 키
2. 구글·네이버: OAuth 클라이언트 Redirect URI
3. Netlify/EC2 env: `NEXT_PUBLIC_*` 전체
4. 백엔드: CORS·쿠키 allowed origin — [BACKEND.md](./BACKEND.md)
5. [DEPLOY.md](./DEPLOY.md) 체크리스트

---

## 관련 문서

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [AUTH.md](./AUTH.md)
- [ENV.md](./ENV.md)
