# 보안 (프론트엔드)

이 문서는 DS-Helper **사용자 웹 프론트** 기준 체크리스트입니다. 인프라·백엔드 하드닝은 [backend](https://github.com/DS-Helper/backend) 레포와 별도입니다.

## Public 저장소 정책

이 레포는 **공개(Public)** 입니다. 아래는 `docs/`, README, Issue, PR, WORKLOG, 커밋 메시지에 **넣지 않습니다**.

| 금지 | 대신 |
|------|------|
| 이메일·전화번호·실명 | GitHub `@handle`만 필요 시 (선택) |
| 테스트 계정 ID·비밀번호 | 협업자에게 **비공개**로 전달 (암호 관리 도구 등) |
| OAuth·API 키 실값 | 로컬 **`.env`** / Netlify·EC2 시크릿만 |
| 운영자 개인 연락처 | [GitHub Security Advisories](https://github.com/DS-Helper/frontend/security/advisories) (취약점) 또는 조직 내부 채널 |
| 스크린샷에 로그인·토큰·주민정보 | 마스킹 후 첨부 |

문서·코드 리뷰 시 위 항목이 diff에 없는지 확인합니다.

## 비밀·환경 변수

| 규칙 | 설명 |
|------|------|
| 커밋 금지 | **`.env`**, API 키, SSH 키 (`deploy_key`, `*.pem`) — `.gitignore` 적용됨 |
| 예시만 커밋 | [`.env.example`](../.env.example) — 값 없음 |
| `NEXT_PUBLIC_*` | **브라우저에 노출** — 비밀키·관리자 토큰 넣지 말 것 |
| 서버 전용 | `KAKAO_REST_API_KEY` — `pages/api/kakao-address.ts`에서만 사용 권장 |

배포 시크릿:

- **EC2:** 서버 파일 권한, GitHub Actions secrets (`EC2_*`)
- **Netlify:** 대시보드 env — 팀원 최소 권한

### 키 발급 (값·로그인 정보는 문서화하지 않음)

- 카카오 디벨로퍼스 / Google Cloud / 네이버 개발자센터 — 콘솔 접근 권한은 **조직에서 비공개로** 공유 ([INTEGRATIONS.md](./INTEGRATIONS.md))
- REST API·JavaScript(지도) 키 구분 — REST 키를 지도 SDK에 쓰면 401

### 테스트 계정

- QA·기관 테스트용 자격 증명은 **협업자 비공개 채널**로만 전달
- 로컬 **`.env`** 또는 개인 비밀 관리 도구에만 보관 (`.env.local` 미사용)

## 인증·세션

| 항목 | 구현 |
|------|------|
| 토큰 저장 | Zustand persist (`user-store`) — localStorage |
| refreshToken | persist 제외 필드 — 탭 종료 시 소실 가능, 재로그인 |
| API | `Authorization: Bearer` + 개인 check 시 `refreshToken` 헤더 |
| 401 | `resetUserSession()` — [AUTH.md](./AUTH.md) |
| 로그아웃 | `POST /logout` + 세션 초기화 |

**하지 말 것**

- `DEV_MOCK_LOGGED_IN_INDIVIDUAL = true` 커밋
- 실제 토큰·PII를 이슈/PR/WORKLOG에 붙여넣기
- accessToken을 URL query에 실어 보내기

## OAuth

- Redirect URI는 **등록된 origin만** — [INTEGRATIONS.md](./INTEGRATIONS.md)
- state (네이버): 콜백에서 검증 — 백엔드·프론트 콜백 코드 확인
- OAuth login 엔드포인트에는 Authorization 헤더 미부착 (`axios.tsx`)

## 사용자 데이터·업로드

| 기능 | 주의 |
|------|------|
| 게시판·문의 이미지 | multipart — 파일 타입·크기는 백엔드 검증 전제 |
| 프로필 이미지 | `patchMyInfo` FormData |
| XSS | React 기본 이스케이프 — `dangerouslySetInnerHTML` 사용 금지 (현재 지양) |

## 의존성

- `npm audit` — 주기적 확인 (CI 연동 권장)
- lockfile (`package-lock.json`) 커밋 유지

## 배포·저장소

| 항목 | 권장 |
|------|------|
| `prd` push | 자동 EC2 배포 — 직접 push 최소화, PR 리뷰 |
| SSH 키 | Actions secrets만, 레포에 없음 |
| GitHub | Public repo — 이슈에 시크릿·개인정보 금지 |

## 제3자 스크립트

- **카카오 지도 SDK** — 카카오 CDN script inject (`loadKakaoMapSdk.ts`)
- CSP 도입 시 `dapi.kakao.com`, `kauth.kakao.com` 등 허용 목록 백엔드/인프라와 조율

## 사고·유출 시 (요약)

1. 노출된 키·토큰 **즉시 로테이션** (카카오·OAuth·API)
2. 영향 받은 env (Netlify/EC2) 갱신
3. 사용자 세션: 백엔드에서 토큰 무효화 가능 여부 확인
4. 필요 시 [CHANGELOG.md](./CHANGELOG.md) / 팀 공지

## PR 전 보안 체크

- [ ] env·키 파일 diff 없음
- [ ] `console.log`에 토큰·개인정보 없음
- [ ] 새 `NEXT_PUBLIC_` 변수가 정말 공개 가능한지
- [ ] 외부 URL `window.open`에 `noopener` (지도 링크 등 — 기존 패턴 따름)

## 관련 문서

- [AUTH.md](./AUTH.md)
- [ENV.md](./ENV.md)
- [BACKEND.md](./BACKEND.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
