# 협업·코딩 규칙

## Git·브랜치

| 브랜치 | 용도 |
|--------|------|
| `main` | GitHub 기본 브랜치 |
| `ja`, `sr` 등 | **기능 작업 브랜치** — 로컬 개발·커밋 |
| `dev` | 1차 통합 · **Netlify** (`test.dshelper.kr`) |
| `prd` | 프로덕션 · **EC2 자동 배포** (`dshelper.kr`) |

### 권장 흐름

1. 작업 브랜치에서 개발 → 로컬 테스트  
2. **`dev`로 PR** → Netlify에서 QA  
3. **`prd`로 PR** → GitHub Actions → EC2 (실서비스)

`prd` merge는 반드시 2단계 검증 후. 상세: [DEPLOY.md](./DEPLOY.md).

## 문의·리뷰

- 기능·버그: **GitHub Issue** / PR 코멘트 (Public 레포 — [SECURITY.md](./SECURITY.md) 참고)
- 배포·env·API 키: Issue에 **값 붙여넣기 금지**, 필요 시 조직 비공개 채널
- UI 시안: Figma 코멘트 또는 PR에 스크린샷·링크

## 커밋 메시지

### 브랜치별 접두사 (팀 규칙)

| 현재 브랜치 | 접두사 | 의미 |
|-------------|--------|------|
| `ja` 등 **작업 브랜치** | `feat:` | 기능 개발 → 이후 **`dev`로 PR** (Netlify 테스트) |
| `dev` | `prd:` | `dev` 통합·검증 → 이후 **`prd`로 PR** (프로덕션) |

예:

- `feat: 휴지통 지도 위치 1회 조회로 변경`
- `prd: dev QA 반영 — OAuth redirect test 도메인 정리`

`fix:`, `docs:`, `chore:` 등은 필요 시 접두사 **앞에** 붙이지 않고, 위 팀 접두사와 함께 쓸지는 PR 단위로 통일합니다. (혼란 시 `feat:` / `prd:` + 본문에 `fix` 성격을 적어도 됨.)

### 한 커밋 = 한 덩어리 (권장)

통째로 한 번에 커밋하기보다, **리뷰·되돌리기 쉬운 단위**로 나눕니다.

| 나누기 좋은 기준 | 예 |
|------------------|-----|
| 기능 하나 | `feat: 휴지통 React Query 전환` |
| 버그만 | `feat: 바텀시트 닫힘 애니메이션 수정` |
| dead code·의존성 | `feat: 미사용 패키지 제거` |
| 문서만 | `feat: ONBOARDING·DEPLOY 문서 보강` (코드 없으면 `docs:`도 가능) |

**한 커밋에 섞지 말 것:** 무관한 페이지 수정 + 대량 포맷 + `.env` 실수.

### 메시지 형식

```
<접두사> <한 줄 요약 (50자 내외)>

(선택) 본문: 왜 바꿨는지, 스크린샷·이슈 번호
```

- 한글·영어 모두 가능, **의도가 드러나게**
- conventional commit(`fix:`, `refactor:`)은 팀 접두사(`feat:`/`prd:`)와 병행 시 팀과 맞출 것

### Cursor에게 커밋 요청할 때

"커밋해줘"라고 하면 에이전트가:

1. `git status` / `git diff`로 변경 범위 확인
2. **현재 브랜치**에 맞는 접두사 (`ja` → `feat:`, `dev` → `prd:`)
3. 논리 단위로 **여러 커밋**으로 나누는안 제안 또는 실행 (원하면 한 번에도 가능)
4. `.env`·시크릿·개인정보는 **스테이징 제외**

명시적으로 말하면 더 정확합니다.

- "기능별로 나눠서 커밋해줘"
- "문서만 따로 커밋"
- "이번 건 통으로 한 커밋" (급할 때만)

## Pull Request

- 변경 요약, 스크린샷(UI), 테스트 방법
- API·env 변경 시 문서 링크 (`docs/` 해당 파일)
- 백엔드 PR과 짝이면 상호 링크

## 코드 스타일

- TypeScript strict 준수
- React: 함수 컴포넌트, hooks
- import alias: `@/` → `src/`
- SCSS: 모듈 단위, semantic color 변수 우선
- `console.log` 디버그는 PR 전 제거 (의도적 `console.error`/`debug`는 유지 가능)

## API 레이어

- 파일: `src/lib/apis/<domain>.tsx`
- axios `instance`만 사용 (baseURL·인터셉터 공유)
- 응답 파싱이 복잡하면 같은 파일에 `parse*` 함수

## 환경·시크릿

- **`.env`** 개인·환경별 관리, 커밋 금지 (`.env.local` 미사용)
- Netlify/EC2는 대시보드·시크릿으로 동기화

## 릴리스·CHANGELOG

| 이벤트 | 문서 작업 |
|--------|-----------|
| `prd` merge (프로덕션 배포) | [CHANGELOG.md](./CHANGELOG.md)에 Added/Changed/Fixed 기록 |
| 큰 기능 | [ROADMAP.md](./ROADMAP.md) 완료 항목 체크 |
| 아키텍처 결정 | [DECISIONS.md](./DECISIONS.md) ADR 한 줄 추가 |

CHANGELOG 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/). **Unreleased** 섹션을 PR마다 쌓아 두고, `prd` 배포 시 버전·날짜 섹션으로 옮깁니다.

## 문서

- 기능 브랜치: `docs/worklog/<branch>.md` 업데이트 ([WORKLOG.md](./WORKLOG.md))
- 제품·아키텍처 변경: PRD / ARCHITECTURE / DECISIONS
- 배포·Netlify·EC2: [DEPLOY.md](./DEPLOY.md)

## 리뷰 시 체크

- [ ] 모바일·OAuth·지도 영향 여부
- [ ] 401/403 UX
- [ ] 불필요한 dependency 추가 없음
- [ ] 달성군 서비스 카피·정책 위반 없음
