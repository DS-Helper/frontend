# QA 체크리스트 (수동)

자동 테스트(`*.test.ts`, E2E)는 현재 없습니다. 배포 전·PR 전 아래를 **접속 환경별**로 확인하세요.  
기록은 [WORKLOG.md](./WORKLOG.md) / PR에 남기면 됩니다.

## 테스트 환경

| 환경 | URL | API |
|------|-----|-----|
| 로컬 | http://localhost:3000 | **`.env`** → TEST URL 또는 `localhost:8080` |
| 스테이징 | https://test.dshelper.kr | Netlify (`dev` 브랜치 배포), be-test API는 **IP 허용** 필요 |
| 프로덕션 | https://dshelper.kr | EC2 env — **신중히** |

## 브라우저·기기 지원

| 구분 | 권장 / 지원 |
|------|-------------|
| **주 타깃** | 모바일 브라우저 (iOS Safari, Android Chrome) |
| **데스크톱** | 최신 Chrome·Edge·Firefox — 일반 화면 QA 가능 |
| **휴지통 지도** (`/trash-bin-list`) | **모바일만** — 데스크톱은 "핸드폰에서 사용 가능" 메시지 (`trash-bin-list/index.tsx`) |
| **카카오 지도 SDK** | Web 플랫폼 도메인 등록 필수 ([INTEGRATIONS.md](./INTEGRATIONS.md)) |
| **위치 권한** | 휴지통·일부 지도 — HTTPS 또는 localhost에서 geolocation |
| **IE** | 미지원 (Next.js 16·React 19) |

자동화 브라우저 테스트는 없음 — 위 환경에서 **수동** 확인.

## 공통 사전 조건

- [ ] `npm run build` 성공
- [ ] `npx tsc --noEmit` 통과
- [ ] `npm run lint` (가능 시)
- [ ] 백엔드 해당 환경 API 기동
- [ ] OAuth·지도 콘솔에 **해당 origin** Redirect / Web 도메인 등록

---

## 1. 홈 (`/`)

- [ ] 메인 배너·안내 탭 전환
- [ ] 비로그인 → 도움 요청 시 `/login` 이동
- [ ] 로그인 후 → `/help` 이동
- [ ] 도와드린 이야기 목록 노출 (API 실패 시 빈 목록/에러 UX)
- [ ] 푸터·헤더 링크

---

## 2. 로그인 — 개인 (`/login`)

### 카카오

- [ ] 로그인 → 카카오 → 콜백 → 홈, 헤더 로그인 상태
- [ ] 새로고침 후에도 로그인 유지

### 구글 / 네이버

- [ ] 각각 동일 플로우
- [ ] redirect mismatch 없음

### 실패 케이스

- [ ] OAuth 취소 시 적절한 메시지·로그인 페이지 유지

---

## 3. 로그인 — 기관 (`/login/org`)

- [ ] 올바른 계정 → 홈, 기관 예약 API 동작
- [ ] 잘못된 비밀번호 → alert/메시지
- [ ] 로그아웃 후 개인 SNS 로그인과 상태 섞이지 않음

**테스트 계정:** 기관용 자격 증명은 **협업자 비공개 채널**로만 받습니다. 이메일·비밀번호·실명은 Git·`docs/`·PR·스크린샷에 적지 않습니다.

---

## 4. 도움 예약

| 단계 | 경로 | 확인 |
|------|------|------|
| 신청 | `/help` → `/help/modify` | 필수값, 날짜·시간 |
| 완료 | `/help/complete` | 안내 문구 |
| 목록 | `/helpList` | 상태·상세·**취소** confirm |
| 중복 예약 | modify 제출 | 403 시 "중복 예약" 메시지 (개인) |

- [ ] 개인 계정 → personal API
- [ ] 기관 계정 → organization API

---

## 5. 도와드린 이야기 (`/helpStory`)

- [ ] 목록·페이지네이션/검색 (구현된 경우)
- [ ] 상세 `/helpStory/[id]` — 이미지·본문
- [ ] (권한 있을 때) 작성·수정

---

## 6. 게시판 (`/board`)

- [ ] 목록·카테고리 필터
- [ ] 글쓰기 `/board/write` — 이미지 첨부
- [ ] 상세 — 좋아요·스크랩·댓글·대댓글
- [ ] 수정·삭제 (본인 글)
- [ ] 신고: TODO 상태면 버튼만/미동작 확인 ([KNOWN_ISSUES.md](./KNOWN_ISSUES.md))

---

## 7. 휴지통 지도 (`/trash-bin-list`)

**모바일 뷰포트 권장** (데스크톱은 안내 문구만)

- [ ] 위치 권한 안내 confirm (최초 1회)
- [ ] 지도 로드·마커 표시
- [ ] 마커 탭 → 바텀시트
- [ ] 길찾기 시트 열림/닫힘 **슬라이드 애니메이션**
- [ ] 출발/도착 → 카카오맵 새 탭
- [ ] 위치 공유 (Web Share 또는 클립보드)
- [ ] 위치 거부 시에도 앱 크래시 없음

---

## 8. 고객 문의 (`/customer`)

- [ ] 문의 등록 (유형·내용·이미지)
- [ ] 내 문의 목록
- [ ] 답변 완료 건 → 답변 모달

---

## 9. 계정 (`/account`)

- [ ] 프로필·이름 수정
- [ ] 스크랩·내 글 목록
- [ ] SNS 연동 해제 (해당 제공자)
- [ ] 탈퇴 플로우 (`/account/delete`)

---

## 10. 알림 (헤더)

- [ ] 알림 아이콘 → 모달 열림/닫힘 애니메이션
- [ ] 목록: API 미연동 시 빈 상태 UI ([KNOWN_ISSUES.md](./KNOWN_ISSUES.md))

---

## 11. 정적·법적

- [ ] `/terms`, `/privacy` 렌더링
- [ ] `sitemap.xml`, `robots.txt` (배포 URL 기준)

---

## 12. 회귀 — 인증·API

- [ ] 로그인 상태에서 API 401 시 세션 정리·재로그인 유도
- [ ] test 호스트에서 prod API로 나가지 않음 (Network baseURL)
- [ ] `prd` 배포 후 EC2에서 동일 시나리오 스모크 (홈·로그인·지도)

---

## 버그 리포트 템플릿

```
환경: local | test.dshelper.kr | dshelper.kr
브라우저:
계정: 개인(카카오/…) | 기관
재현:
기대:
실제:
Network: (실패 API URL, status)
스크린샷:
```

---

## 관련 문서

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOY.md](./DEPLOY.md)
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
