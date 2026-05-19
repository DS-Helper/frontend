# 배포

## 환경 요약

| 환경 | URL | 프론트 배포 | API |
|------|-----|-------------|-----|
| 프로덕션 | https://dshelper.kr | AWS EC2 + pm2 | `NEXT_PUBLIC_API_URL` |
| 테스트 | https://test.dshelper.kr | Netlify | `NEXT_PUBLIC_TEST_API_URL` |
| 어드민 | https://admin.dshelper.kr | Netlify | 별도 (이 레포 아님) |

호스트 분기: [ENV.md](./ENV.md), `src/lib/config/domainEnv.ts`.

## 프로덕션 (EC2)

### 트리거

- GitHub Actions: `.github/workflows/deploy.yml`
- **브랜치**: `prd`에 push 시

### 서버 절차 (워크플로가 SSH로 실행)

1. `nvm use 20`
2. `cd ~/frontend`
3. `git pull origin prd`
4. `npm install`
5. `npm run build`
6. `pm2 reload dshelper` (없으면 `pm2 start dshelper`)

### 필요 시크릿 (GitHub)

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

### 서버 환경 변수

EC2 `~/frontend`에 `.env` 또는 배포 파이프라인에서 주입. 프로덕션 키·`NEXT_PUBLIC_API_URL`은 **dshelper.kr** 기준으로 설정.

## 테스트 (Netlify)

- 도메인: `test.dshelper.kr`
- 빌드: `npm run build` (팀 Netlify 설정 따름)
- `localhost`와 동일하게 테스트 API·OAuth redirect test 변수 사용

Netlify 대시보드·브랜치 미리보기 정책은 팀 문서에 맞게 운영.

## 로컬 vs 배포 빌드

```bash
npm run build
npm run start   # 프로덕션 모드 로컬 검증
```

## 배포 전 체크리스트

- [ ] `npx tsc --noEmit` / `npm run lint`
- [ ] OAuth Redirect URI가 대상 도메인에 등록됨
- [ ] 카카오 지도 JavaScript 키 도메인 허용
- [ ] 백엔드 CORS·쿠키 도메인 (필요 시 백엔드 팀과 확인)
- [ ] `prd` merge는 팀 리뷰 후 (자동 배포됨)

## 롤백

- EC2: 이전 커밋으로 `git checkout` 후 재빌드·pm2 reload
- Netlify: 이전 deploy 복구 (Netlify UI)

## 관련 문서

- [ONBOARDING.md](./ONBOARDING.md)
- [CHANGELOG.md](./CHANGELOG.md)
