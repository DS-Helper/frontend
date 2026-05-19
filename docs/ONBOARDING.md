# 온보딩

DS-Helper 사용자 프론트엔드 저장소입니다. 신규 협업자는 이 문서부터 읽고 [ENV.md](./ENV.md) → [ARCHITECTURE.md](./ARCHITECTURE.md) 순으로 이어가면 됩니다.

## 저장소

| 구분 | URL |
|------|-----|
| 프론트엔드 (이 저장소) | https://github.com/DS-Helper/frontend |
| 백엔드 | https://github.com/DS-Helper/backend |

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
- 백엔드 API가 기동 중이거나, 테스트/스테이징 API URL을 `.env.local`에 설정

## 로컬 실행

```bash
git clone https://github.com/DS-Helper/frontend.git
cd frontend
npm install
cp .env.example .env.local   # 없으면 ENV.md 참고해 직접 작성
npm run dev
```

브라우저: http://localhost:3000

## 환경 변수

`.env.local`은 git에 포함되지 않습니다. 필수·선택 항목은 [ENV.md](./ENV.md)를 따르세요.

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

각 개발자 콘솔에 위 URI를 등록하고, `.env.local`의 `NEXT_PUBLIC_*_OAUTH_REDIRECT_URI(_TEST)`와 맞춥니다.

## 기관(조직) 로그인

- 경로: `/login/org`
- API: `POST /auth/login/organization` (백엔드)
- 토큰은 Zustand `userStore`의 `accessToken`으로 관리

## 브랜치·배포 요약

| 브랜치 | 용도 |
|--------|------|
| `main` | 기본 브랜치 (GitHub 기준) |
| `prd` | EC2 프로덕션 자동 배포 트리거 |
| `dev`, `ja` 등 | 기능 개발 (팀 규칙에 따름) |

`prd`에 push하면 [DEPLOY.md](./DEPLOY.md) 워크플로가 EC2에서 pull → build → pm2 reload를 수행합니다. **테스트 사이트(Netlify)는 별도 연결**이므로 PR/브랜치 정책은 팀과 확인하세요.

## 작업 로그 (브랜치 단위)

기능 브랜치별 작업 내역은 [WORKLOG.md](./WORKLOG.md)를 참고하세요. 브랜치를 checkout하면 해당 `docs/worklog/<브랜치명>.md`를 함께 가져올 수 있습니다.

## 다음에 읽을 문서

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — 폴더·인증·상태 관리
2. [API_FRONTEND.md](./API_FRONTEND.md) — 백엔드 호출 목록
3. [CONVENTIONS.md](./CONVENTIONS.md) — PR·코딩 규칙
4. [AGENTS.md](./AGENTS.md) — AI 도구 사용 시 규칙
