# DS-Helper Frontend

대구 **달성군** 생활밀착형 플랫폼 **디에스헬퍼** 사용자 웹 앱입니다.

| 환경 | URL |
|------|-----|
| 프로덕션 | https://dshelper.kr |
| 테스트 | https://test.dshelper.kr |

- 프론트엔드: https://github.com/DS-Helper/frontend  
- 백엔드: https://github.com/DS-Helper/backend  
- 어드민: https://github.com/DS-Helper/admin  

## 꼭 읽을 문서 (2개)

처음 합류하거나 작업 시작 전에만 보면 됩니다. 나머지는 필요할 때 [`docs/`](./docs/)에서 찾으세요.

1. **[docs/ONBOARDING.md](./docs/ONBOARDING.md)** — 로컬 실행, env, 브랜치·배포 흐름 (`ja` → `dev` → `prd`)
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** — PR 규칙, **기능별 커밋**·브랜치별 메시지 접두사 (`feat:` / `prd:`)

## 빠른 시작

```bash
npm install
# .env 는 docs/ENV.md 참고 (.env.example 복사)
npm run dev
```

http://localhost:3000

## 나머지 문서

인덱스: [docs/README.md](./docs/README.md) · Public 레포 주의: [docs/SECURITY.md](./docs/SECURITY.md)

자주 쓰는 것만: [ARCHITECTURE](./docs/ARCHITECTURE.md) · [ENV](./docs/ENV.md) · [DEPLOY](./docs/DEPLOY.md) · [TROUBLESHOOTING](./docs/TROUBLESHOOTING.md)

## 스택

Next.js (Pages Router) · React 19 · TypeScript · SCSS Modules · TanStack Query · Zustand · Axios · Kakao Map SDK

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

## 카카오 OAuth (요약)

Redirect URI는 접속 도메인과 일치해야 합니다.

| 환경 | 예시 |
|------|------|
| 로컬 | `http://localhost:3000/kakao/callback` |
| 테스트 | `https://test.dshelper.kr/kakao/callback` |
| 프로덕션 | `https://dshelper.kr/kakao/callback` |

자세한 키·변수: [docs/ENV.md](./docs/ENV.md), [docs/ONBOARDING.md](./docs/ONBOARDING.md).

## 배포

- **dshelper.kr**: `prd` 브랜치 push → GitHub Actions → EC2 (`pm2 reload dshelper`)
- **test.dshelper.kr**: Netlify

[docs/DEPLOY.md](./docs/DEPLOY.md)
