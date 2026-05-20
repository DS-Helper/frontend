# 백엔드 협업 (프론트 관점)

API의 **정본(source of truth)**은 백엔드 저장소입니다.

- **Backend:** https://github.com/DS-Helper/backend  
- **Frontend:** https://github.com/DS-Helper/frontend (이 문서)

프론트는 REST 클라이언트·UI만 담당합니다. 비즈니스 규칙·DB·권한 최종 판단은 백엔드에서 이루어집니다.

## 역할 분담

| 영역 | 백엔드 | 프론트 (이 레포) |
|------|--------|------------------|
| REST API·DB | O | 호출만 |
| OAuth client secret | O | redirect URI·code 전달 |
| JWT/토큰 발급·검증 | O | 저장·헤더 부착 |
| 카카오 지도 JS SDK | — | 브라우저 로드 |
| 카카오 주소 REST | O (직접 or 동일 키) | `/api/kakao-address` 프록시 |
| 어드민 UI | [DS-Helper/admin](https://github.com/DS-Helper/admin) — FE/BE 모노레포, 브랜치 분리 | 사용자 앱만 |
| 배포 | API 서버 | dshelper.kr(EC2), test(Netlify) |

## API 베이스 URL

프론트 env ([ENV.md](./ENV.md)):

| 변수 | Base URL | Swagger UI |
|------|----------|------------|
| `NEXT_PUBLIC_API_URL` | `https://server.dshelper.kr` | [server.dshelper.kr/swagger-ui](https://server.dshelper.kr/swagger-ui/index.html) |
| `NEXT_PUBLIC_TEST_API_URL` | `https://be-test.dshelper.kr` | [be-test.dshelper.kr/swagger-ui](https://be-test.dshelper.kr/swagger-ui/index.html) |

프론트 접속 호스트와 API 환경 매핑:

| 프론트 | API env 변수 |
|--------|----------------|
| `dshelper.kr` | `NEXT_PUBLIC_API_URL` |
| `test.dshelper.kr`, `localhost` | `NEXT_PUBLIC_TEST_API_URL` |

### API 경로·접근

- **공통 prefix 없음** — `/api/v1` 등 없이 루트에 리소스 (`GET /boards`, `POST /oauth/kakao/login` …). 최신 계약은 [Swagger](https://server.dshelper.kr/swagger-ui/index.html) / [test Swagger](https://be-test.dshelper.kr/swagger-ui/index.html) 기준.
- **`be-test`:** **IP 제한** 있음. 아래 절차로 허용 요청.

### be-test IP 허용 요청

Public Issue에 사유·개인 연락처 없이 **공인 IP만** 적습니다.

```
제목: [be-test] IP allowlist 요청
본문:
- IP: x.x.x.x (예: 사무실 egress / 집 / VPN)
- 용도: 로컬 개발 | Netlify test.dshelper.kr QA
- 기간: 상시 | ~YYYY-MM-DD
```

- 로컬: 집·사무실 IP 변경 시마다 재요청
- Netlify: 빌드 머신 IP가 고정이 아닐 수 있음 — backend 팀과 preview/고정 egress 정책 협의
- 허용 전에는 `be-test` Swagger·API 호출이 타임아웃·403처럼 보일 수 있음 → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 어드민 레포 (admin)

| 항목 | 내용 |
|------|------|
| URL | https://admin.dshelper.kr |
| 레포 | https://github.com/DS-Helper/admin |
| 구조 | FE·BE **모노레포**, 디렉터리·**브랜치**로 분리 |
| 사용자 앱 API | 이 frontend와 **동일 API 서버를 쓸 수도·별도일 수도** 있음 — admin env 확인 |
| 배포 | Netlify (브랜치는 admin 레포 README 기준) |

어드민 스펙·브랜치명은 admin 레포 문서가 정본입니다.
- **로컬 백엔드:** 기본 `http://localhost:8080` ([ENV.md](./ENV.md)).

## 스펙 확인 절차

1. **Swagger UI** (위 링크) — 엔드포인트·스키마·try it out
2. **백엔드 README** — [github.com/DS-Helper/backend](https://github.com/DS-Helper/backend) 실행 방법·프로필
3. **GitHub Issues / PR** — breaking change 공지
4. **프론트 매핑** — [API_FRONTEND.md](./API_FRONTEND.md)에 반영 여부
5. **로컬 연동** — TEST API + test redirect URI로 E2E 수동 ([QA.md](./QA.md))

새 API 추가 시 프론트 PR에 다음을 포함하면 리뷰가 빨라집니다.

- 메서드·경로·auth 필요 여부
- request/response 예시 (JSON)
- 에러 코드 (401/403/409 등)
- multipart 여부

## 인증 협업

| 주제 | 설명 |
|------|------|
| 개인 check | `GET /auth/check-logged-in` + **`refreshToken` 헤더** (Bearer 아님) — [AUTH.md](./AUTH.md) |
| 기관 check | `GET /auth/check-logged-in/organization` + Bearer **access** |
| OAuth | `POST /oauth/{provider}/login` — body에 code(+ state) |
| 로그아웃 | `POST /logout` |
| CORS | 프론트 origin 허용 + `credentials` |
| 쿠키 | HttpOnly 사용 시 프론트는 `withCredentials: true`만 설정 |

토큰 필드명이 `accessToken` / `access_token` / `data.accessToken` 등으로 올 수 있어 프론트 `applyLoginResponseTokens`가 여러 형태를 파싱합니다. **신규 형태 추가 시 양쪽 합의**.

## 경로·네이밍 주의

프론트 코드에 실제 사용 중인 경로 (오타 포함 시 백엔드와 **의도적으로 일치**하는지 확인):

| 프론트 호출 | 비고 |
|-------------|------|
| `GET /inquires/all` | 문의 (spelling: inquires) |
| `POST /inquires` | |
| `GET /board/{id}` vs `GET /boards` | 단수/복수 혼용 |
| `POST /comment` vs `GET /comments/...` | |

백엔드 리네이밍 시 **프론트 `lib/apis/*` + API_FRONTEND.md** 동시 수정.

## CORS·쿠키 체크리스트 (백엔드 설정 요청)

새 도메인·환경 추가 시 백엔드에 요청할 항목:

- [ ] `https://dshelper.kr`
- [ ] `https://test.dshelper.kr`
- [ ] `http://localhost:3000` (개발)
- [ ] `Access-Control-Allow-Credentials: true` (쿠키 사용 시)
- [ ] Allowed headers: `Authorization`, `refreshToken`, `Content-Type`

## 환경별 배포와 API

| 프론트 | 배포 | 연결 API env |
|--------|------|----------------|
| dshelper.kr | EC2, `prd` branch | `NEXT_PUBLIC_API_URL` |
| test.dshelper.kr | Netlify | `NEXT_PUBLIC_TEST_API_URL` |
| admin.dshelper.kr | Netlify | (별도 앱 — 이 레포 아님) |

API 서버도 prod/test가 분리되어 있어야 합니다. **프론트 test + API prod** 조합은 데이터·인증 사고 위험이 있습니다.

## 이슈·변경 요청 템플릿

**백엔드 이슈 (프론트에서 발행 시)**

```
[Frontend need] 
환경: test | prod
엔드포인트:
현재 동작:
기대 동작:
프론트 브랜치/PR:
스크린샷·Network 캡처:
```

**Breaking change 시 백엔드→프론트 알림에 포함할 것**

- deprecated 일정
- 필드 rename / 제거
- auth 방식 변경
- 배포 순서 (API 먼저 vs 프론트 먼저)

## 관련 문서

- [API_FRONTEND.md](./API_FRONTEND.md)
- [AUTH.md](./AUTH.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [SECURITY.md](./SECURITY.md)
