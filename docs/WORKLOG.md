# WORKLOG (브랜치 단위)

기능 브랜치마다 **별도 마크다운 파일**로 작업 맥락을 남깁니다.  
1인 포트폴리오의 단일 `WORKLOG.md` 대신, **협업·병렬 브랜치**에서 충돌 없이 기록하기 위한 구조입니다.

## 브랜치를 가져와서 쓸 수 있나?

**예.** 각 브랜치에 `docs/worklog/<브랜치명>.md`를 커밋해 두면:

1. `git checkout feature/xxx` → 해당 브랜치의 worklog 파일이 working tree에 따라옴
2. `git merge feature/xxx` → main 등에 worklog 파일이 합쳐짐
3. 이 인덱스(`WORKLOG.md`)만 main에서 최신 브랜치 목록을 유지해도 됨

**팁**

- 브랜치 시작: `docs/worklog/_template.md` 복사 → `docs/worklog/<브랜치명>.md`
- PR 전: 목적·변경 파일·테스트·미완 TODO·백엔드 의존 기록
- `prd` 배포 후: 필요 시 CHANGELOG에 요약 반영

## 인덱스

| 브랜치 | Worklog | 상태 |
|--------|---------|------|
| `ja` | [worklog/ja.md](./worklog/ja.md) | 활성 (지도·정리·문서) |
| `prd` | — | 배포 브랜치 (기능 worklog는 merge 후 보관) |
| `main` | — | 기본 |
| `dev` | — | (필요 시 파일 추가) |

새 브랜치 worklog를 만들면 **이 표에 한 줄 추가**하세요.

## 템플릿

[worklog/_template.md](./worklog/_template.md)

## 관련

- [CONVENTIONS.md](./CONVENTIONS.md)
- [CHANGELOG.md](./CHANGELOG.md) — 릴리스 단위 요약
