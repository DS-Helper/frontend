# 알려진 이슈·제한사항

의도적으로 남겨 둔 TODO·미구현·플랫폼 제한입니다. 수정 예정은 [ROADMAP.md](./ROADMAP.md)도 함께 보세요.

## 미연동 기능 (API 대기)

| 기능 | 위치 | 상태 |
|------|------|------|
| 알림 목록 | `NotificationListModal.tsx` | TODO — 빈 배열, API 미연동 |
| 게시판 신고 | `board/[id]/index.tsx` | TODO — 모달/API 없음 |
| 휴지통 즐겨찾기 | (제거됨) | 백엔드 API 없어 UI 삭제 — 재도입 시 ROADMAP |

## UI·플랫폼 제한

| 항목 | 설명 |
|------|------|
| 휴지통 지도 | 데스크톱: "핸드폰에서 사용 가능" — `trash-bin-list` |
| 휴지통 위치 | 진입 시 **1회** geolocation — 실시간 추적·내 위치 마커 없음 |
| 휴지통 데이터 | `page=0&size=100` 고정 — 전체 페이징 UI 없음 |
| 알림 | 모달 UI만 — 헤더 이벤트 `openNotificationModal` |

## 인증·세션

| 항목 | 설명 |
|------|------|
| refreshToken | localStorage persist 안 됨 — 탭/브라우저 정책에 따라 재로그인 필요할 수 있음 |
| `getToken()` | 항상 null — HttpOnly 쿠키는 JS에서 읽지 않음 |
| 기관 로그인 | refreshToken 없을 때 warn만 — 동작은 access 기준 |

## API·에러 처리

| 항목 | 설명 |
|------|------|
| API 실패 | 많은 `lib/apis/*` 함수가 `null` 반환 — 페이지마다 alert/빈 UI 상이 |
| 403 (예약 제외) | 전역 alert — UX 통일은 미완 |
| 경로 철자 | `/inquires` — 백엔드 계약 그대로 사용 |

## 기술 부채

| 항목 | 설명 |
|------|------|
| 자동 테스트 | unit/E2E 없음 — [QA.md](./QA.md) 수동 |
| React Query | 휴지통 등 일부만 사용 — 나머지 useEffect fetch |
| `reactStrictMode` | `next.config.ts`에서 false |
| Pages Router | App Router 미전환 |

## 이슈 등록 시

- 재현 가능한 버그 → GitHub Issue (frontend 레포)
- API 스펙·버그 → backend 레포 + 프론트 라벨
- 보안 취약점 → [GitHub Security Advisory](https://github.com/DS-Helper/frontend/security/advisories) 또는 조직 비공개 채널 ([SECURITY.md](./SECURITY.md))

## 관련 문서

- [ROADMAP.md](./ROADMAP.md)
- [QA.md](./QA.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
