# 트러블슈팅

증상별로 확인할 파일·환경 변수를 정리했습니다. 온보딩은 [ONBOARDING.md](./ONBOARDING.md), 인증 상세는 [AUTH.md](./AUTH.md), 외부 연동은 [INTEGRATIONS.md](./INTEGRATIONS.md)를 참고하세요.

## 공통 진단 순서

1. **접속 URL** — `localhost` / `test.dshelper.kr` / `dshelper.kr` 중 어디인지
2. **`.env.local` 재시작** — env 변경 후 `npm run dev` 재기동
3. **브라우저 Network** — API base URL·status·CORS
4. **호스트 분기** — `src/lib/config/domainEnv.ts` (`*_TEST` vs 프로덕션)

---

## OAuth / 로그인

### 증상: `redirect_uri` mismatch (카카오·구글·네이버)

| 확인 | 내용 |
|------|------|
| 콘솔 등록 URI | **접속 origin + 콜백 경로**와 문자 단위 일치 |
| 카카오 | `/kakao/callback` — [INTEGRATIONS.md](./INTEGRATIONS.md) |
| 로컬 | `http://localhost:3000/kakao/callback` (포트 포함) |
| 테스트 | `https://test.dshelper.kr/kakao/callback` |
| 프로덕션 | `https://dshelper.kr/kakao/callback` |
| env | `NEXT_PUBLIC_*_OAUTH_REDIRECT_URI(_TEST)` |
| 코드 | `authUser.tsx` — 테스트 호스트는 **현재 `window.location.origin` 우선** |

**레거시 경로:** 예전 Redirect가 `/oauth/kakao/login`이면 `src/pages/oauth/kakao/login.tsx`가 `/kakao/callback`으로 넘깁니다. 콘솔에는 **최종 콜백 URI**를 등록하세요.

### 증상: 로그인 후 바로 로그아웃·홈에서 비로그인

| 확인 | 내용 |
|------|------|
| refreshToken | 개인 로그인 응답에 `refreshToken` 필수 (`completeIndividualSnsLogin.ts`) |
| check-auth | `GET /auth/check-logged-in` — 헤더 `refreshToken` (Bearer 아님) |
| 레이스 | OAuth 직후 `checkAuthStatus({ force: true })` — 토큰 저장 전 API 호출 여부 |
| Zustand | Application → Local Storage → `user-store` |
| 코드 | `userStore.ts`, `axios.tsx` 인터셉터 |

### 증상: 구글/네이버만 실패, 카카오는 됨

- 백엔드 `GET /oauth/google/login-url`, `/oauth/naver/login-url` 응답 확인
- `replaceOAuthAuthorizeRedirectUri`가 redirect를 프론트 콜백으로 덮어씀 — 백엔드 URL 자체가 깨진 경우 404

### 증상: 기관 로그인 실패

- API: `POST /auth/login/organization` — 에러는 `login/org.tsx`에서 alert
- `userType`이 `organization`인지, `accessToken`이 저장됐는지
- 검증: `GET /auth/check-logged-in/organization` (Authorization에 **access**)

---

## API / 네트워크

### 증상: API가 엉뚱한 서버로 감

| 호스트 | 사용 변수 |
|--------|-----------|
| localhost, test.dshelper.kr | `NEXT_PUBLIC_TEST_API_URL` 우선 |
| dshelper.kr | `NEXT_PUBLIC_API_URL` 우선 |

코드: `src/lib/apis/axios.tsx`

### 증상: 401 후 로그인 풀림

- 의도된 동작: `axios` 응답 인터셉터 → `resetUserSession()` (`/auth/check-logged-in` 제외)
- 토큰 만료·잘못된 env API 서버일 때 발생

### 증상: 403 + alert "권한이 없습니다"

- 예약 API(`personal-reservations`, `organization-reservations`)는 alert **생략**
- 그 외 403은 `axios.tsx`에서 alert 가능 — 역할·백엔드 권한 확인

### 증상: CORS / 쿠키 안 붙음

- `withCredentials: true` 설정됨
- 백엔드 CORS에 프론트 origin 허용 필요 → [BACKEND.md](./BACKEND.md)

---

## 카카오 지도 (휴지통)

### 증상: 지도 401 / "JavaScript 키" 안내

| 확인 | 내용 |
|------|------|
| 키 종류 | **JavaScript 키** (`NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY(_TEST)`) — REST API 키 사용 시 실패 |
| 플랫폼 | 카카오 디벨로퍼스 → 앱 → **플랫폼 > Web** → `http://localhost:3000` 등 **포트까지** 등록 |
| 사전 검사 | `/api/kakao-map-sdk-check` — 401이면 키/도메인 문제 |
| 코드 | `loadKakaoMapSdk.ts`, `kakaoMapEnv.ts` |

env 변경 후 **개발 서버 재시작**.

### 증상: 지도는 뜨는데 마커/목록 없음

- 위치 권한 거부 시 `geoGateOk` false → Query `enabled: false`
- `GET /trash-bins?page=0&size=100` Network 탭 확인
- 백엔드 데이터·달성군 좌표 범위

### 증상: 데스크톱에서 "핸드폰에서 사용 가능"

- 의도된 UI (`trash-bin-list/index.tsx`) — 모바일 레이아웃만 지도 표시

---

## 빌드·배포

### 증상: EC2 배포 후 이전 화면

- `prd` push 여부, Actions 성공 여부
- 서버 `~/frontend`에서 `git pull`, `npm run build`, `pm2 reload dshelper`
- [DEPLOY.md](./DEPLOY.md)

### 증상: test(Netlify)만 깨짐

- Netlify 환경 변수에 `NEXT_PUBLIC_TEST_*` 전부 설정
- 빌드 브랜치·캐시 삭제 후 재배포

---

## 개발 도구

### `npx tsc --noEmit` 실패

- 경로 alias `@/` — `tsconfig.json` paths 확인

### Zustand 상태가 이상함

- `localStorage.removeItem('user-store')` 후 재로그인
- `userStore.ts`의 `DEV_MOCK_LOGGED_IN_INDIVIDUAL`이 **false**인지 (커밋 금지)

---

## 관련 문서

- [AUTH.md](./AUTH.md)
- [INTEGRATIONS.md](./INTEGRATIONS.md)
- [ENV.md](./ENV.md)
- [BACKEND.md](./BACKEND.md)
