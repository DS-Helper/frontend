# 아키텍처

## 개요

```
[브라우저]
    │
    ├─ Next.js Pages Router (React 19)
    │     ├─ pages/*          라우트·화면
    │     ├─ components/*     UI
    │     ├─ lib/apis/*       백엔드 REST 클라이언트
    │     ├─ lib/store/*      Zustand (세션·유저)
    │     └─ pages/api/*      BFF (카카오 프록시 등)
    │
    └─ HTTPS ──► 백엔드 API (별도 레포)
              https://github.com/DS-Helper/backend
```

- **역할 분리**: 비즈니스·DB·인증 발급은 백엔드. 이 저장소는 UI, 라우팅, 토큰 보관, 지도·OAuth 클라이언트 플로우.
- **지역 서비스**: 대구 달성군 생활밀착형 플랫폼 (도움 예약, 게시판, 휴지통 지도 등). 상세는 [DOMAIN.md](./DOMAIN.md), [PRD.md](./PRD.md).

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (Pages Router) |
| UI | React 19, SCSS Modules |
| 서버 상태 | TanStack React Query v5 |
| 클라이언트 세션 | Zustand + persist (`user-store`) |
| HTTP | Axios (`withCredentials: true`) |
| 지도 | Kakao Maps JavaScript SDK (dynamic import, SSR off) |

## 디렉터리 구조

```
src/
├── pages/              # 라우트 (파일 = URL)
├── components/         # 공통·도메인 컴포넌트
│   ├── common/         # Header, Footer, Sidebar
│   ├── trashBin/       # 휴지통 지도
│   ├── board/          # 게시판 댓글 등
│   ├── kakao|google|naver/  # OAuth UI·콜백
│   └── Modal/          # 알림·답변 모달 등
├── lib/
│   ├── apis/           # 백엔드 endpoint 래퍼
│   ├── store/          # userStore
│   ├── config/         # domainEnv (호스트 분기)
│   ├── maps/           # 카카오 지도 SDK 로더
│   ├── oauth/          # 로그인 완료 처리
│   └── utils/          # auth, logout 등
├── styles/             # globals.css + *.module.scss
└── types/              # TS 타입
```

## 라우트 맵 (주요)

| 경로 | 설명 |
|------|------|
| `/` | 홈·서비스 소개 |
| `/login`, `/login/org` | 개인 SNS / 기관 로그인 |
| `/kakao/callback`, `/google/callback`, `/naver/callback` | OAuth 콜백 |
| `/help`, `/help/modify`, `/help/complete` | 도움 요청·예약 |
| `/helpList` | 예약 목록·취소 |
| `/helpStory`, `/helpStory/[id]` | 도와드린 이야기 |
| `/board`, `/board/write`, `/board/[id]` | 커뮤니티 게시판 |
| `/trash-bin-list` | 공공 쓰레기통 지도 (모바일 UI) |
| `/customer` | 고객 문의 |
| `/account/*` | 마이페이지·스크랩·탈퇴 |
| `/terms`, `/privacy` | 약관 |

## 인증 흐름

### 개인 (SNS)

1. 로그인 페이지에서 카카오/구글/네이버 시작
2. 제공자 → authorization code → 콜백 페이지
3. `POST /oauth/{provider}/login` → 응답 토큰을 `applyLoginResponseTokens`로 Zustand 저장
4. `_app.tsx`에서 `checkAuthStatus()` → `GET /auth/check-logged-in` (refresh 토큰 기준)
5. 로그인 후 `getMyIdentifier()`로 `userId`, `userRole` 보강

### 기관

1. `POST /auth/login/organization` → `accessToken` 저장
2. `GET /auth/check-logged-in/organization` (access 토큰을 Authorization에 사용)

### Axios 인터셉터

- 대부분 요청에 `Authorization: Bearer …` 부착 (OAuth login URL 등 일부 제외)
- `401` → `resetUserSession()` (check-logged-in 제외)
- `403` → 예약 API 외 alert 가능

## 상태 관리 원칙

| 데이터 | 저장소 | 비고 |
|--------|--------|------|
| 로그인·토큰·userType | Zustand `userStore` | persist |
| 휴지통 목록 | React Query | `getTrashBins`, `enabled`는 위치 동의 후 |
| 그 외 목록/상세 | 주로 useEffect + API 또는 Query | 페이지별 상이 |

서버에서 가져오는 목록은 **Zustand 중복 캐시 없이 Query 또는 페이지 state**를 우선합니다.

## Next.js API Routes (BFF)

| 경로 | 역할 |
|------|------|
| `/api/kakao-address` | 카카오 로컬 API 프록시 (키 서버 보관) |
| `/api/kakao-map-sdk-check` | 지도 SDK 스크립트 URL HEAD/GET 검사 |

백엔드 REST와 별도로, 브라우저에 노출되면 안 되는 키·CORS 이슈를 줄이기 위한 얇은 레이어입니다.

## 전역 레이아웃 (`_app.tsx`)

- `QueryClientProvider`
- `Header` / `Footer` 고정
- `NotificationListModal` — `window` 커스텀 이벤트 `openNotificationModal` (현재 알림 데이터는 API 미연동, TODO)

## 배포 아키텍처 (이 앱)

- **dshelper.kr**: EC2, `prd` push → SSH → `npm run build` → `pm2 reload dshelper`
- **test.dshelper.kr**: Netlify (프론트만; API는 `NEXT_PUBLIC_TEST_API_URL`)

자세한 절차: [DEPLOY.md](./DEPLOY.md).

## 관련 문서

- [API_FRONTEND.md](./API_FRONTEND.md)
- [DESIGN.md](./DESIGN.md)
- [DECISIONS.md](./DECISIONS.md)
