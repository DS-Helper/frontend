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

### Cursor(에이전트) 커밋 워크플로

팀 기본 절차입니다. **"커밋해줘"** 한마디만으로도 아래 순서를 따릅니다.

| 단계 | 담당 | 내용 |
|------|------|------|
| 1. 분석 | 에이전트 | `git status`, `git diff`, 최근 `git log`로 변경·브랜치·커밋 스타일 확인 |
| 2. 계획안 | 에이전트 | 커밋 개수, 각 커밋 메시지(`feat:`/`prd:`), 포함·제외 파일 목록을 **표로 제시** |
| 3. 승인 | **사람** | 계획안 확인 후 "진행해줘" / 수정 요청 |
| 4. 실행 | 에이전트 | 승인된 범위만 `git add` → `git commit` (**로컬만**) |
| 5. 푸시 | **사람** | `git push`는 **에이전트가 하지 않음**. 필요 시 직접 push |

**에이전트가 하지 않는 것**

- 승인 전 커밋
- `git push` (사용자가 명시적으로 "푸시해줘"라고 해도, 기본은 사람이 직접 push)
- `.env`·시크릿·개인정보 스테이징

**계획안에 넣을 것**

- 현재 브랜치와 접두사 (`ja` 등 → `feat:`, `dev` → `prd:`)
- 커밋별 메시지(한 줄)와 파일 목록
- 제외 파일(`.env` 등)과 이유

**예외 (사용자가 명시할 때)**

- "계획안만 보여줘" → 2단계까지만
- "N번안대로 커밋해줘" → 이미 합의된 계획이면 3단계 생략 가능
- "통으로 한 커밋" → 급할 때만 1커밋으로 계획

상세: [AGENTS.md](./AGENTS.md#커밋-요청-워크플로)

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
