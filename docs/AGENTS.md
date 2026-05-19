# AGENTS — AI·협업 도구 가이드

Cursor 등 AI가 이 저장소를 수정할 때 따를 규칙입니다.

## 프로젝트 정체

- **레포**: https://github.com/DS-Helper/frontend
- **백엔드**: https://github.com/DS-Helper/backend (API 계약의 source of truth)
- **지역**: 대구 달성군 생활밀착형 웹 앱 (dshelper.kr)

## 읽기 순서

1. [ONBOARDING.md](./ONBOARDING.md)
2. [ARCHITECTURE.md](./ARCHITECTURE.md)
3. [API_FRONTEND.md](./API_FRONTEND.md)
4. 작업 브랜치의 [worklog/](./worklog/) 파일

## 코드 규칙

- **언어**: 사용자 UI 문구·커밋 설명은 한국어 가능, 식별자는 기존 영어 관례 유지
- **스타일**: SCSS Modules, `className` + `cn()`, camelCase 클래스명
- **`!important`**: 3rd-party override 외 사용 금지
- **범위**: 요청된 기능만 수정. 무관한 리팩터·의존성 추가 금지
- **상태**: 서버 데이터는 React Query 우선; Zustand는 `userStore`(세션) 위주
- **API**: 새 호출은 `src/lib/apis/`에 모듈 추가, `instance` 사용

## Public 레포

- `docs/`, Issue, PR, WORKLOG에 **이메일·전화·실명·테스트 계정·키 실값** 금지 — [SECURITY.md](./SECURITY.md)

## 건드리지 말 것 (확인 없이)

- `prd` 브랜치 직접 push (자동 EC2 배포)
- `.env` 실값·시크릿 커밋
- `userStore`의 `DEV_MOCK_LOGGED_IN_INDIVIDUAL`을 true로 커밋
- 백엔드 URL·OAuth redirect를 임의로 변경

## 백엔드 협업

- 엔드포인트 추가·변경 시 `API_FRONTEND.md`와 해당 `lib/apis/*.tsx` 동시 갱신
- 스펙 불명확하면 backend 레포 이슈/문서 확인 후 가정하지 말 것

## 문서 갱신

| 변경 유형 | 갱신 문서 |
|-----------|-----------|
| 새 API 사용 | API_FRONTEND.md, BACKEND.md |
| env 키 추가 | ENV.md, INTEGRATIONS.md |
| OAuth·로그인 변경 | AUTH.md, TROUBLESHOOTING.md |
| 배포 절차 변경 | DEPLOY.md |
| 구조·인증 변경 | ARCHITECTURE.md, DECISIONS.md |
| 미구현·TODO | KNOWN_ISSUES.md, ROADMAP.md |
| 브랜치 작업 마무리 | docs/worklog/\<branch\>.md, WORKLOG.md 인덱스 |

## 테스트

- 타입: `npx tsc --noEmit`
- 린트: `npm run lint`
- 지도·OAuth는 로컬에서 수동 확인 필요

## WORKLOG

브랜치별 파일: `docs/worklog/<branch-name>.md`. 작업 종료 시 요약·결정·미완 TODO를 남깁니다.
