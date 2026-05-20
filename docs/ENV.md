# 환경 변수

로컬·개발 환경은 프로젝트 루트 **`.env` 한 파일**만 사용합니다 (`.env.local`은 쓰지 않음).

`.env` 및 `.env*`는 `.gitignore`에 포함되어 커밋되지 않습니다. 값 없는 템플릿은 [`.env.example`](../.env.example) → 복사해 `.env` 작성. 배포는 EC2 `~/frontend/.env`, Netlify 환경 변수 패널에 동일 키를 설정합니다.

## 호스트별 분기

`src/lib/config/domainEnv.ts`가 클라이언트 hostname을 보고 프로덕션/테스트 값을 고릅니다.

| 호스트 | 분기 |
|--------|------|
| `test.dshelper.kr`, `localhost`, `127.0.0.1` | `*_TEST` 또는 테스트용 값 우선 |
| 그 외 (예: `dshelper.kr`) | 프로덕션 값 우선 |

동일 패턴을 쓰는 모듈: `axios.tsx`, `authUser.tsx`, `kakaoMapEnv.ts`, `kakao-address.ts` API Route.

## 백엔드 API

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 프로덕션 백엔드 base URL |
| `NEXT_PUBLIC_TEST_API_URL` | 테스트/로컬용 백엔드 base URL |

**배포된 API (Swagger UI)**

| 환경 | Base URL (권장) | API 문서 |
|------|-----------------|----------|
| 프로덕션 | `https://server.dshelper.kr` | [Swagger](https://server.dshelper.kr/swagger-ui/index.html) |
| 테스트 | `https://be-test.dshelper.kr` | [Swagger](https://be-test.dshelper.kr/swagger-ui/index.html) |

- **API 경로:** 공통 prefix 없음 — Swagger·호출 모두 **루트 기준** (`/boards`, `/oauth/...` 등). 상세는 Swagger UI 참고.
- **be-test 접근:** 항상 공개가 아니며 **IP 제한** 있음. 사무실/VPN 등 허용 IP에서만 호출 가능. 로컬·Netlify QA 전에 백엔드에 IP 등록 요청.

Axios `instance`의 `baseURL`로 사용됩니다 (`src/lib/apis/axios.tsx`). 끝에 `/` 없이 설정하세요.

### 백엔드 로컬 실행 (풀스택 개발)

백엔드를 로컬에서 띄울 때 기본 포트는 **8080**입니다.

```env
# 예: 로컬 백엔드 + 로컬 프론트
NEXT_PUBLIC_TEST_API_URL=http://localhost:8080
NEXT_PUBLIC_TEST_APP_ORIGIN=http://localhost:3000
```

이 경우 카카오·OAuth 콘솔에 `http://localhost:3000/.../callback` 등록이 필요합니다. 원격 테스트 API를 쓸 때는 `https://be-test.dshelper.kr`(IP 허용 후)를 사용합니다.

## 앱 Origin (OAuth redirect 조합)

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_APP_ORIGIN` | 프로덕션 프론트 origin (예: `https://dshelper.kr`) |
| `NEXT_PUBLIC_TEST_APP_ORIGIN` | 테스트 origin (예: `https://test.dshelper.kr`) |

## OAuth Redirect URI

호스트 분기 적용. 카카오는 프론트에서 authorize URL을 직접 조합할 때도 사용합니다.

| 변수 |
|------|
| `NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI` |
| `NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI_TEST` |
| `NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI` |
| `NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI_TEST` |
| `NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI` |
| `NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI_TEST` |

## 카카오 키

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` / `_TEST` | REST API (주소 검색 등) |
| `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY` / `_TEST` | 지도 SDK (휴지통 지도) |
| `KAKAO_REST_API_KEY` / `KAKAO_REST_API_KEY_TEST` | 서버 API Route (`pages/api/kakao-address.ts`) |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | Route에서 public 키 fallback |

지도 로드 전 `/api/kakao-map-sdk-check`로 SDK URL 접근 가능 여부를 확인합니다.

## 환경별 OAuth Redirect URI (등록용)

콘솔에 **문자 단위**로 등록합니다. 코드·env 상세는 [INTEGRATIONS.md](./INTEGRATIONS.md).

| 환경 | Origin | 카카오 | 구글 | 네이버 |
|------|--------|--------|------|--------|
| 로컬 | `http://localhost:3000` | `/kakao/callback` | `/google/callback` | `/naver/callback` |
| Netlify QA | `https://test.dshelper.kr` | 동일 패턴 | 동일 | 동일 |
| 프로덕션 | `https://dshelper.kr` | 동일 패턴 | 동일 | 동일 |

Netlify 배포 시 `NEXT_PUBLIC_TEST_APP_ORIGIN=https://test.dshelper.kr` 및 `*_TEST` redirect env를 test origin에 맞춥니다.

## Netlify (`test.dshelper.kr`) env 체크리스트

| 변수 | 권장 값 (공개 문서 — 실제 키는 Netlify UI만) |
|------|---------------------------------------------|
| `NEXT_PUBLIC_TEST_API_URL` | `https://be-test.dshelper.kr` |
| `NEXT_PUBLIC_TEST_APP_ORIGIN` | `https://test.dshelper.kr` |
| `NEXT_PUBLIC_*_OAUTH_REDIRECT_URI_TEST` | `https://test.dshelper.kr/{kakao\|google\|naver}/callback` |
| `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST` | (시크릿) |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST` | (시크릿) |
| `KAKAO_REST_API_KEY_TEST` | (시크릿) |

배포 절차: [DEPLOY.md](./DEPLOY.md).

## 로컬 `.env` 예시 (값은 팀 시크릿으로 교체)

```env
NEXT_PUBLIC_API_URL=https://server.dshelper.kr
NEXT_PUBLIC_TEST_API_URL=https://be-test.dshelper.kr

NEXT_PUBLIC_APP_ORIGIN=https://dshelper.kr
NEXT_PUBLIC_TEST_APP_ORIGIN=http://localhost:3000

# OAuth redirect — 경로만 제공자별로 다름 (호스트 + /kakao|google|naver/callback)
NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI=https://dshelper.kr/kakao/callback
NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI_TEST=http://localhost:3000/kakao/callback
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI=https://dshelper.kr/google/callback
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI_TEST=http://localhost:3000/google/callback
NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI=https://dshelper.kr/naver/callback
NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI_TEST=http://localhost:3000/naver/callback
# Netlify QA: NEXT_PUBLIC_TEST_APP_ORIGIN=https://test.dshelper.kr
#            *_TEST redirect → https://test.dshelper.kr/{kakao|google|naver}/callback

NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST=
NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST=
```

스펙 상세: Swagger 링크는 [BACKEND.md](./BACKEND.md). 소스: [DS-Helper/backend](https://github.com/DS-Helper/backend).

## 주의

- `NEXT_PUBLIC_*`는 브라우저에 노출됩니다. 비밀키는 서버 전용 변수(`KAKAO_REST_API_KEY` 등)로만 두세요.
- 프로덕션·테스트 키를 혼용하면 OAuth redirect mismatch가 납니다. 접속 URL과 쌍을 맞추세요.
