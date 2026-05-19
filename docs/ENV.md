# 환경 변수

`.env*` 파일은 `.gitignore`에 포함되어 저장소에 올라가지 않습니다. 로컬은 `.env.local`, 배포 환경은 서버/Netlify/EC2 시크릿에 동일 키를 설정합니다.

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

Axios `instance`의 `baseURL`로 사용됩니다 (`src/lib/apis/axios.tsx`).

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

## 로컬 `.env.local` 예시 (값은 팀 시크릿으로 교체)

```env
NEXT_PUBLIC_API_URL=https://api.dshelper.kr
NEXT_PUBLIC_TEST_API_URL=https://api-test.dshelper.kr

NEXT_PUBLIC_APP_ORIGIN=https://dshelper.kr
NEXT_PUBLIC_TEST_APP_ORIGIN=http://localhost:3000

NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI=https://dshelper.kr/kakao/callback
NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI_TEST=http://localhost:3000/kakao/callback

NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST=your_kakao_javascript_key
NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST=your_kakao_rest_key
```

백엔드 실제 URL은 [DS-Helper/backend](https://github.com/DS-Helper/backend) README 또는 팀 문서를 따릅니다.

## 주의

- `NEXT_PUBLIC_*`는 브라우저에 노출됩니다. 비밀키는 서버 전용 변수(`KAKAO_REST_API_KEY` 등)로만 두세요.
- 프로덕션·테스트 키를 혼용하면 OAuth redirect mismatch가 납니다. 접속 URL과 쌍을 맞추세요.
