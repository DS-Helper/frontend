# 기술·제품 결정 기록 (ADR 요약)

형식: 날짜 · 결정 · 맥락 · 결과

---

## 2026-05 — 휴지통 데이터: Zustand 제거, React Query 단일 소스

**맥락**  
휴지통 목록이 Zustand(`trashBinStore`)와 React Query에 중복 캐시됨.

**결정**  
`TrashBinListMapView`는 `useQuery`의 `data`만 사용. `trashBinStore` 삭제.

**이유**  
서버 상태는 Query가 적합하고, 동기화 버그·불필요 refetch를 줄임.

---

## 2026-05 — 휴지통 지도: 위치 추적 제거, 1회 geolocation

**맥락**  
`watchPosition`·내 위치 마커·팔로우 버튼이 API·배터리 비용을 키움.

**결정**  
최초 동의 후 `getCurrentPosition` 1회 → 지도 중심·거리 라벨·목록 fetch 1회.  
Query: `enabled: geoGateOk`, refetchOnFocus/Mount/Reconnect: false.

**이유**  
공공 쓰레기통 탐색에는 진입 시점 기준 거리면 충분.

---

## 2026-05 — 바텀시트 닫힘 애니메이션 CSS 순서

**맥락**  
`.mapTapSheet`가 `.mapTapSheetClosing`보다 뒤에 선언되어 transform이 무시됨.

**결정**  
`.mapTapSheet.mapTapSheetClosing` 등 복합 선택자를 **base 뒤**에 배치.

---

## 2026-05 — 미구현 UI 제거 (즐겨찾기·전화 인증 모달)

**맥락**  
휴지통 즐겨찾기 버튼·`PhoneVerifyModal`에 API/연동 없음.

**결정**  
UI·dead code 삭제. API 준비 시 ROADMAP에서 재도입.

---

## 2026-05 — Pages Router 유지

**맥락**  
Next.js App Router 전환 검토 가능성.

**결정**  
당분간 Pages Router 유지. 전환 시 라우트·`_app`·API routes 일괄 마이그레이션 필요.

---

## 2026-05 — 호스트 기반 API 분기 (`domainEnv`)

**맥락**  
프로덕션(dshelper.kr)·테스트(test.dshelper.kr/localhost)가 같은 빌드로 동작.

**결정**  
`pickValueByHost`로 `NEXT_PUBLIC_*` / `*_TEST` 쌍 선택.

**이유**  
빌드 아티팩트 분리 없이 Netlify·EC2 배포 단순화.

---

## 신규 결정 추가 방법

1. 이 파일 하단에 위와 동일 형식으로 추가
2. 큰 변경은 PR 설명에 ADR 링크
3. 브랜치 worklog에도 한 줄 요약
