# 기여 가이드 (Contributing)

DS-Helper **사용자 웹** 프론트엔드([DS-Helper/frontend](https://github.com/DS-Helper/frontend)) 협업 규칙입니다.  
상세는 [`docs/`](./docs/)를 참고하세요.

> 이 저장소는 **Public**입니다. Issue·PR·`docs/`에 이메일·테스트 계정·API 키 실값을 적지 마세요. → [docs/SECURITY.md](./docs/SECURITY.md)

## 시작하기

1. [docs/ONBOARDING.md](./docs/ONBOARDING.md) — 로컬 실행·env
2. [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) — 브랜치·코드 스타일
3. [docs/ENV.md](./docs/ENV.md) — 환경 변수

## 브랜치·배포 흐름

| 단계 | Git | 배포 |
|------|-----|------|
| 개발 | `ja` 등 작업 브랜치 | 로컬 `npm run dev` |
| 1차 QA | **`dev`로 PR** | Netlify → https://test.dshelper.kr |
| 프로덕션 | **`prd`로 PR** | EC2 → https://dshelper.kr (GitHub Actions) |

`prd` merge는 Netlify QA 이후에만 진행합니다. → [docs/DEPLOY.md](./docs/DEPLOY.md)

## 커밋 (기능별로 나누기)

| 브랜치 | 메시지 접두사 |
|--------|----------------|
| `ja` 등 작업 브랜치 | `feat:` → 이후 `dev` PR |
| `dev` | `prd:` → 이후 `prd` PR |

상세·예시: [docs/CONVENTIONS.md](./docs/CONVENTIONS.md#커밋-메시지)

**에이전트에게:** "커밋해줘" / "기능별로 커밋해줘"라고 하면 diff를 보고 접두사를 붙여 커밋할 수 있습니다. push는 별도로 요청하세요.

## Pull Request

### 포함할 내용

- **무엇을 / 왜** 변경했는지 (1~3문장)
- UI 변경 시 **스크린샷** (로그인 화면·토큰·개인정보 마스킹)
- **테스트 방법** (URL, 계정 종류 — 자격 증명 본문은 PR에 쓰지 않음)
- API·env 변경 시 `docs/` 해당 파일 링크
- 백엔드 변경이 있으면 backend 레포 PR 링크

### PR 전 체크

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint` (가능 시)
- [ ] [docs/QA.md](./docs/QA.md) 해당 섹션
- [ ] `.env` / 시크릿 파일이 diff에 없음
- [ ] `console.log` 디버그 제거

### 리뷰·머지

- `dev` · `prd`는 리뷰 후 merge 권장
- `prd` merge 시 [docs/CHANGELOG.md](./docs/CHANGELOG.md) 갱신 ([docs/CONVENTIONS.md](./docs/CONVENTIONS.md))

## 이슈

| 유형 | 레포 |
|------|------|
| 프론트 UI·버그 | [DS-Helper/frontend](https://github.com/DS-Helper/frontend/issues) |
| API·스펙 | [DS-Helper/backend](https://github.com/DS-Helper/backend/issues) |
| 보안 취약점 | [Security Advisories](https://github.com/DS-Helper/frontend/security/advisories) |

재현 단계·브라우저·접속 URL·Network 탭 status를 포함하면 처리가 빠릅니다. **개인정보·토큰 전체 문자열은 첨부하지 마세요.**

## 문서·작업 로그

- 기능 브랜치: `docs/worklog/<branch>.md` ([docs/WORKLOG.md](./docs/WORKLOG.md))
- 제품·아키텍처 변경: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

## 관련 레포

| 레포 | 용도 |
|------|------|
| [backend](https://github.com/DS-Helper/backend) | REST API |
| [admin](https://github.com/DS-Helper/admin) | 어드민 FE+BE (`admin.dshelper.kr`) |
