# 로드맵

우선순위는 팀·백엔드 일정에 따라 조정합니다. 백엔드 의존 항목은 [backend](https://github.com/DS-Helper/backend) 이슈와 연동하세요.  
현재 미구현·제한 사항은 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)를 참고하세요.

## 단기 (프론트)

| 항목 | 상태 | 비고 |
|------|------|------|
| 알림 목록 API 연동 | TODO | `NotificationListModal` — 현재 빈 목록 |
| README·온보딩 정리 | 진행됨 | `docs/` 추가 |
| 휴지통 즐겨찾기 | 보류 | API 확정 후 UI 재도입 |
| Netlify test 배포 브랜치·env 문서화 | TODO | [DEPLOY.md](./DEPLOY.md) 보강 |

## 중기

| 항목 | 비고 |
|------|------|
| React Query 확대 | 게시판·문의 등 useEffect fetch 정리 |
| 접근성 점검 | WCAG, 키보드·스크린리더 |
| E2E (Playwright) | 예약·로그인 스모크 |
| 에러 바운더리·공통 Empty/Error UI | |

## 백엔드 협업 필요

| 항목 | 비고 |
|------|------|
| 알림 push/목록 API | 스펙·페이징 |
| 휴지통 즐겨찾기 | CRUD |
| 예약 403 메시지 통일 | 중복 예약 등 |
| CORS·쿠키 (test/prod) | 도메인 추가 시 |

## 인프라

| 항목 | 비고 |
|------|------|
| Netlify 테스트 ↔ API 환경 문서화 | 팀 시크릿 목록 |
| EC2 `.env` 관리 표준화 | 배포 체크리스트 |
| Staging 브랜치 정책 | prd 외 preview |

## 비목표 (당분간)

- App Router 전면 전환
- 네이티브 앱
- 이 레포에서 어드민 기능 구현

## 완료 (최근)

- 휴지통 지도 성능·UX 개선 (1회 위치, Query)
- 코드 정리·dead code 제거 (2026-05)
