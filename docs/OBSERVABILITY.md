# 관측·분석 (Observability)

이 레포에 포함된 **클라이언트 측** 관측 수단만 정리합니다. 서버 APM·로그는 [backend](https://github.com/DS-Helper/backend) 레포를 참고하세요.

## Google Tag Manager (GTM)

| 항목 | 내용 |
|------|------|
| 컨테이너 ID | `GTM-W9SFJS2J` |
| 삽입 위치 | `src/pages/_document.tsx` (`<Head>` script + `<body>` noscript iframe) |
| 범위 | 모든 페이지 (Pages Router 공통 `_document`) |

### 변경 시

- GTM 콘솔에서 태그·트리거 수정 후 **배포 없이** 반영되는 경우가 많음
- 컨테이너 ID 변경 시 `_document.tsx` 수정 + `prd` 배포 필요
- **Public 레포**에 GTM 외부 시크릿·개인 식별 데이터를 커밋하지 않음

### QA

- [ ] 프로덕션·테스트 각각 GTM 미리보기/디버그 모드로 이벤트 수신 확인 (필요 시)
- [ ] 로컬 `localhost`는 GTM 정책에 따라 이벤트가 제외될 수 있음

## 애플리케이션 에러 로깅

| 항목 | 상태 |
|------|------|
| Sentry / Datadog RUM | **미연동** (코드베이스 기준) |
| Axios 403 | `console.error` + 일부 `alert` (`src/lib/apis/axios.tsx`) |
| 페이지 catch | `console.error` + `alert` (페이지별 상이) |

프로덕션 클라이언트 에러 수집 도입 시 이 문서와 [SECURITY.md](./SECURITY.md)를 함께 갱신합니다.

## 배포·런타임 확인

| 환경 | 확인 방법 |
|------|-----------|
| EC2 | SSH 후 `pm2 logs dshelper`, `pm2 status` ([DEPLOY.md](./DEPLOY.md)) |
| Netlify | Netlify 대시보드 → Deploy log |
| GitHub Actions | Actions 탭 → `Deploy to EC2` 워크플로 |

## 관련 문서

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOY.md](./DEPLOY.md)
