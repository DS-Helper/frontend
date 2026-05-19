# Worklog: `ja`

| 항목 | 내용 |
|------|------|
| 브랜치 | `ja` |
| 기간 | 2026-05 (진행 중) |
| 관련 | 지도 앱, 모달 모션, 코드 정리, docs 초안 |

## 목적

- 공공 쓰레기통 지도 UX 개선 (바텀시트·길찾기·마커)
- 위치/API 비용 절감 (1회 geolocation, React Query)
- dead code·미구현 UI 정리
- 협업용 `docs/` 문서화

## 변경 요약

### 지도 (`TrashBinListMapView`)

- 바텀시트·길찾기 시트 open/close 슬라이드 애니메이션
- closing 클래스 CSS cascade 수정
- `watchPosition`·내 위치 마커·팔로우 버튼 제거 → 진입 시 1회 위치
- 휴지통 목록: Zustand 제거, `useQuery` only
- 미구현 즐겨찾기 버튼 제거 (B8)

### 정리 (A-1 ~ A-6)

- 의존성: `react-router-dom`, `js-cookie` 제거
- 파일 삭제: `hello.ts`, `Layout`, `HelpSidebar`, `scrapStorage`, `PhoneVerifyModal`, `trashBinStore`
- public 미사용 에셋 삭제
- `console.log` 제거 (customer, help, oauth 등)

### 문서

- `docs/` 전체 트리 추가 (ONBOARDING ~ WORKLOG)
- README 갱신

## 주요 파일

| 경로 | 변경 |
|------|------|
| `src/components/trashBin/TrashBinListMapView.tsx` | 지도·Query·UI |
| `src/styles/TrashBinList.module.scss` | 시트 애니메이션, dead class 제거 |
| `src/lib/apis/trashBin.tsx` | (기존) 목록 fetch |
| `src/types/trashBin.ts` | 미사용 타입 제거 |
| `package.json` | 의존성 정리 |
| `docs/**` | 신규 |

## 백엔드 의존

- `GET /trash-bins?page=0&size=100` — 기존 계약 유지
- 즐겨찾기: API 없음 → UI 제거만

## 테스트

- [x] `npx tsc --noEmit`
- [ ] `npm run lint` (필요 시)
- [ ] 수동: test.dshelper.kr 또는 localhost — 지도 로드, 시트 닫힘, 길찾기 링크

## 결정·메모

- [DECISIONS.md](../DECISIONS.md)에 Query·1회 위치·CSS 순서 기록

## 미완 / 후속

- [ ] `prd` merge 전 Netlify/팀 QA
- [ ] 알림 API 연동 (별 브랜치 권장)

## PR·배포

- PR: (작성 시 링크)
- `prd` merge 시 EC2 자동 배포
