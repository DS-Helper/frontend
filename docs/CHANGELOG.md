# Changelog

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식.  
배포 단위로 `prd` merge 시 이 파일을 갱신하는 것을 권장합니다.

## [Unreleased]

### Added

- `docs/` 문서 세트 (온보딩, 아키텍처, API, 배포, WORKLOG 브랜치 단위 등)
- 실무 문서: `TROUBLESHOOTING`, `AUTH`, `INTEGRATIONS`, `QA`
- 협업 문서: `BACKEND`, `SECURITY`, `KNOWN_ISSUES`

### Changed

- 휴지통 지도: React Query 단일 소스, 위치 1회 조회 정책
- 바텀시트·길찾기 시트 닫힘 애니메이션 수정

### Removed

- 미사용 의존성: `react-router-dom`, `js-cookie`
- dead code: `hello` API route, `trashBinStore`, `PhoneVerifyModal`, 미사용 public 에셋
- 휴지통 길찾기 시트 미구현 즐겨찾기 버튼
- 디버그 `console.log` 다수

## [과거 이력]

상세 커밋은 Git 히스토리 참고. 최근 예:

- 지도 앱 마커·바텀시트·모션
- 고객문의 모달·도와드린 이야기 검색 API
- 계정 탈퇴 API 연동

```bash
git log --oneline -30
```
