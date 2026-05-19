# 온보딩

DS-Helper 사용자 프론트엔드 저장소입니다. 신규 협업자는 이 문서부터 읽고 [ENV.md](./ENV.md) → [ARCHITECTURE.md](./ARCHITECTURE.md) 순으로 이어가면 됩니다.

> **Public 레포:** 이메일·전화·테스트 계정·API 키 실값은 `docs/`·Issue·PR에 올리지 않습니다. [SECURITY.md](./SECURITY.md)

## 저장소

| 구분 | URL |
|------|-----|
| 프론트엔드 (이 저장소) | https://github.com/DS-Helper/frontend |
| 백엔드 | https://github.com/DS-Helper/backend |
| 어드민 (FE+BE) | https://github.com/DS-Helper/admin |

## 서비스·배포 환경

| 환경 | 도메인 | 배포 | 비고 |
|------|--------|------|------|
| 프로덕션 | https://dshelper.kr | AWS EC2 (`prd` 브랜치 push 시 GitHub Actions) | 이 저장소의 사용자 앱 |
| 테스트 | https://test.dshelper.kr | Netlify | 호스트 기준 테스트 API 분기 |
| 어드민 | https://admin.dshelper.kr | Netlify | 별도 어드민 프론트 (이 저장소 아님) |

로컬 개발 시 `localhost`는 테스트 API·키 분기와 동일하게 취급됩니다 (`src/lib/config/domainEnv.ts`).

## 사전 요구 사항

- Node.js 20 (배포 스크립트·EC2와 동일)
- npm
- 백엔드 API가 기동 중이거나, **`.env`**에 테스트 API 설정 (`https://be-test.dshelper.kr` — [Swagger](https://be-test.dshelper.kr/swagger-ui/index.html))

## 로컬 실행

```bash
git clone https://github.com/DS-Helper/frontend.git
cd frontend
npm install
cp .env.example .env   # 이미 .env가 있으면 ENV.md 참고해 키만 맞춤
npm run dev
```

브라우저: http://localhost:3000

## 환경 변수

**`.env`**는 git에 포함되지 않습니다. 필수·선택 항목은 [ENV.md](./ENV.md)를 따르세요.

## OAuth (개인 회원)

카카오·구글·네이버 SNS 로그인을 사용합니다. Redirect URI는 **실제 접속 origin**과 일치해야 합니다.

| 제공자 | 콜백 경로 (앱 내) |
|--------|-------------------|
| 카카오 | `/kakao/callback` (레거시 `/oauth/kakao/login` → 자동 리다이렉트) |
| 구글 | `/google/callback` |
| 네이버 | `/naver/callback` |

로컬 예: `http://localhost:3000/kakao/callback`  
테스트: `https://test.dshelper.kr/kakao/callback`  
프로덕션: `https://dshelper.kr/kakao/callback`

각 개발자 콘솔에 위 URI를 등록하고, **`.env`**의 `NEXT_PUBLIC_*_OAUTH_REDIRECT_URI(_TEST)`와 맞춥니다.

## 기관(조직) 로그인

- 경로: `/login/org`
- API: `POST /auth/login/organization` (백엔드)
- 토큰은 Zustand `userStore`의 `accessToken`으로 관리

## 브랜치·배포 요약

| 브랜치 | 용도 |
|--------|------|
| `ja` 등 | 기능 작업 → **로컬** 테스트 |
| `dev` | **1차 PR** → Netlify (`test.dshelper.kr`) |
| `prd` | **3차 PR** → EC2 (`dshelper.kr`, GitHub Actions) |

상세 다이어그램: [DEPLOY.md](./DEPLOY.md).

- `be-test` API는 **IP 제한** — 허용 IP 요청 후 연동
- EC2 프로덕션 `NEXT_PUBLIC_API_URL` = `https://server.dshelper.kr`

## 작업 로그 (브랜치 단위)

기능 브랜치별 작업 내역은 [WORKLOG.md](./WORKLOG.md)를 참고하세요. 브랜치를 checkout하면 해당 `docs/worklog/<브랜치명>.md`를 함께 가져올 수 있습니다.

## 다음에 읽을 문서

1. [../CONTRIBUTING.md](../CONTRIBUTING.md) — PR·브랜치·Public 레포 주의
2. [ARCHITECTURE.md](./ARCHITECTURE.md) — 폴더·인증·상태 관리
3. [AUTH.md](./AUTH.md) · [INTEGRATIONS.md](./INTEGRATIONS.md) — 로그인·외부 연동
4. [API_FRONTEND.md](./API_FRONTEND.md) · [BACKEND.md](./BACKEND.md)
5. [DEPLOY.md](./DEPLOY.md) · [OBSERVABILITY.md](./OBSERVABILITY.md)
6. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) · [QA.md](./QA.md)
7. [CONVENTIONS.md](./CONVENTIONS.md) · [AGENTS.md](./AGENTS.md)
