# 협업·코딩 규칙

## Git·브랜치

| 브랜치 | 용도 |
|--------|------|
| `main` | 기본 라인 (GitHub default) |
| `prd` | **프로덕션 자동 배포** — merge 전 리뷰 필수 |
| `dev`, 기능 브랜치 (`ja`, `sr` 등) | 개발·실험 |

- `prd` push = EC2 배포 ([DEPLOY.md](./DEPLOY.md))
- 테스트(Netlify) 연결 브랜치는 팀과 합의

## 커밋 메시지

- 한글·영어 모두 가능, **의도가 드러나게**
- 예: `feat: 휴지통 지도 위치 1회 조회로 변경`, `fix: 바텀시트 닫힘 애니메이션`

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

- `.env.local` 개인별 관리, 커밋 금지
- Netlify/EC2는 대시보드·시크릿으로 동기화

## 문서

- 기능 브랜치: `docs/worklog/<branch>.md` 업데이트 ([WORKLOG.md](./WORKLOG.md))
- 제품·아키텍처 변경: PRD / ARCHITECTURE / DECISIONS

## 리뷰 시 체크

- [ ] 모바일·OAuth·지도 영향 여부
- [ ] 401/403 UX
- [ ] 불필요한 dependency 추가 없음
- [ ] 달성군 서비스 카피·정책 위반 없음
