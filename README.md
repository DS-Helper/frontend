# DS-Helper Frontend

대구 **달성군** 생활밀착형 플랫폼 **디에스헬퍼** 사용자 웹 앱입니다.

| 환경 | URL |
|------|-----|
| 프로덕션 | https://dshelper.kr |
| 테스트 | https://test.dshelper.kr |

- 프론트엔드: https://github.com/DS-Helper/frontend  
- 백엔드: https://github.com/DS-Helper/backend  

## 빠른 시작

```bash
npm install
# .env.local 은 docs/ENV.md 참고
npm run dev
```

http://localhost:3000

## 문서

전체 가이드는 [`docs/`](./docs/) 디렉터리를 보세요.

| 문서 | 설명 |
|------|------|
| [docs/ONBOARDING.md](./docs/ONBOARDING.md) | 로컬 셋업·OAuth·브랜치 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 구조·인증·상태 |
| [docs/API_FRONTEND.md](./docs/API_FRONTEND.md) | 백엔드 호출 목록 |
| [docs/ENV.md](./docs/ENV.md) | 환경 변수 |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | EC2·Netlify 배포 |
| [docs/WORKLOG.md](./docs/WORKLOG.md) | 브랜치별 작업 로그 |

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
