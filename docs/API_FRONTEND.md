# API (프론트엔드 기준)

백엔드 **전체 스펙**은 Swagger UI를 기준으로 합니다.

| 환경 | Swagger |
|------|---------|
| 프로덕션 | https://server.dshelper.kr/swagger-ui/index.html |
| 테스트 | https://be-test.dshelper.kr/swagger-ui/index.html |

소스 레포: [DS-Helper/backend](https://github.com/DS-Helper/backend).  
**경로는 API 루트 기준** (공통 prefix 없음). 전체 스펙·스키마는 Swagger에서 확인합니다.  
이 문서는 **이 프론트엔드가 실제로 호출하는 경로**만 정리합니다.

- Base URL: `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_TEST_API_URL` ([ENV.md](./ENV.md))
- 클라이언트: `src/lib/apis/axios.tsx` (`withCredentials: true`)
- 인증: 대부분 `Authorization: Bearer {accessToken}` (개인 check-logged-in은 예외, 기관은 access)

## 인증·OAuth

| 메서드 | 경로 | 모듈 | 인증 | 용도 |
|--------|------|------|------|------|
| POST | `/oauth/kakao/login` | authUser | X | 카카오 code 교환 |
| GET | `/oauth/google/login-url` | authUser | X | 구글 로그인 URL |
| POST | `/oauth/google/login` | authUser | X | 구글 code 교환 |
| GET | `/oauth/naver/login-url` | authUser | X | 네이버 로그인 URL |
| POST | `/oauth/naver/login` | authUser | X | 네이버 code 교환 |
| GET | `/auth/check-logged-in` | authUser | refresh* | 개인 세션 확인 |
| POST | `/auth/login/organization` | authOrganization | X | 기관 로그인 |
| GET | `/auth/check-logged-in/organization` | authOrganization | access* | 기관 세션 확인 |
| POST | `/auth/join/organization` | authOrganization | X | 기관 가입 |
| POST | `/logout` | utils/logout | O | 로그아웃 |

\* 인터셉터 `tokenRawForRequestUrl` 규칙 참고 (`axios.tsx`).

## 사용자·계정

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| GET | `/user/my-info` | account | 내 정보 |
| PATCH | `/user/my-info` | account | 프로필 수정 (multipart) |
| GET | `/user/my-identifier` | account | userId, role |
| GET | `/boards/scrap` | account | 스크랩 목록 |
| DELETE | `/user/oauth/google` | account | 구글 연동 해제 |
| DELETE | `/user/oauth/kakao` | account | 카카오 연동 해제 |
| DELETE | `/user/oauth/naver` | account | 네이버 연동 해제 |

## 도움 예약 (개인)

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| POST | `/personal-reservations` | reservationUser | 예약 생성 |
| GET | `/personal-reservations/status` | reservationUser | 상태별 목록 |
| GET | `/personal-reservations/{id}` | reservationUser | 상세 |
| PATCH | `/personal-reservations` | reservationUser | 취소 등 |
| GET | `/reservations/pre-reserved` | reservationUser | 날짜별 선점 슬롯 |

## 도움 예약 (기관)

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| POST | `/organization-reservations` | reservationOrg | 예약 생성 |
| GET | `/organization-reservations/status` | reservationOrg | 상태별 목록 |
| GET | `/organization-reservations/{id}` | reservationOrg | 상세 |
| PATCH | `/organization-reservations` | reservationOrg | 취소 등 |

## 도와드린 이야기

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| GET | `/posts` | helpStory | 목록 (query params) |
| POST | `/posts` | helpStory | 작성 |
| GET | `/posts/{postId}` | helpStory | 상세 |
| PUT | `/posts` | helpStory | 수정 |

## 게시판·댓글

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| GET | `/boards` | board | 목록 |
| GET | `/board/{boardId}` | board | 상세 |
| GET | `/boards/me` | board | 내 글 |
| POST | `/boards` | board | 작성 (multipart) |
| PATCH | `/boards` | board | 수정 |
| DELETE | `/board/{boardId}` | board | 삭제 |
| POST | `/board/{boardId}/like` | board | 좋아요 |
| GET | `/{boardId}/like/count` | board | 좋아요 수 |
| POST | `/board/{boardId}/scrap` | board | 스크랩 |
| GET | `/comments/{boardId}/comments` | comment | 댓글 목록 |
| GET | `/comments/{parentId}/children` | comment | 대댓글 |
| POST | `/comment` | comment | 댓글 작성 |
| PATCH | `/comment` | comment | 댓글 수정 |
| DELETE | `/comment` | comment | 댓글 삭제 |

## 고객 문의

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| GET | `/inquires/all` | customer | 내 문의 목록 |
| POST | `/inquires` | customer | 문의 등록 (multipart) |
| GET | `/inquires/{inquiryId}` | customer | 문의 상세 |

## 휴지통 지도

| 메서드 | 경로 | 모듈 | 용도 |
|--------|------|------|------|
| GET | `/trash-bins?page=0&size=100` | trashBin | 공공 쓰레기통 목록 |

응답 파싱: `trashBin.tsx`의 `parseTrashBinsResponse` (페이지 메타·배열 형태 방어적 처리).

## Next.js API (이 저장소)

| 경로 | 용도 |
|------|------|
| `GET/POST /api/kakao-address` | 카카오 주소/좌표 검색 프록시 |
| `GET /api/kakao-map-sdk-check` | 지도 SDK 로드 가능 여부 |

## 미연동·TODO (프론트 코드 기준)

- **알림 목록**: `NotificationListModal` — API TODO, 현재 빈 배열/샘플 주석
- **휴지통 즐겨찾기**: UI 제거됨 (백엔드 API 없음)

## HTTP·에러 처리 (프론트 공통)

구현: `src/lib/apis/axios.tsx` 인터셉터 + 페이지별 `catch`.

### Axios 인터셉터

| status | 동작 | 예외 |
|--------|------|------|
| **401** | `resetUserSession()` — 로그인 상태 초기화 | `GET /auth/check-logged-in` 요청 자체는 reject만 하고 세션 리셋 안 함 |
| **403** | `console.error` | URL에 `personal-reservations` 또는 `organization-reservations` 포함 시 **전역 alert 생략** (페이지에서 처리) |
| **403** (그 외) | `alert("해당 기능에 대한 권한이 없습니다...")` | — |

OAuth login·기관 로그인 URL에는 Authorization 미부착 (`shouldAttachAuthorization`).

### 페이지별 처리 (대표)

| 상황 | 위치 | UX |
|------|------|-----|
| 예약 중복(403) | `help/modify.tsx` | `alert("대기중인 예약이 있는 경우 중복 예약이 불가합니다.")` |
| 예약 실패 | `help/modify.tsx` | `alert("예약에 실패했습니다...")` |
| API 함수 실패 | 다수 `lib/apis/*` | `null` 반환 → 페이지에서 빈 목록·alert (통일되지 않음) |

### 응답 body 형태 (방어적 파싱)

백엔드 스키마는 Swagger 기준이며, 프론트는 아래를 **혼용 대응**합니다.

| 패턴 | 예시 | 사용처 |
|------|------|--------|
| `{ success, data }` | `data` 안에 실제 payload | `parseAccountMyInfoResponse` 등 |
| 평면 객체 | 필드가 루트에 직접 | 동일 파서 fallback |
| Spring Page | `{ content: [], ... }` | 게시판·목록 API |
| 배열 직접 | `response.data`가 배열 | 일부 슬롯 API (`DateTimeSelector`) |
| boolean | `check-logged-in` → `true`/`false` | `userStore.checkAuth` |

신규 API 연동 시 **실제 응답 JSON 샘플**을 PR에 첨부하고(민감정보 제거), 필요하면 `parse*` 헬퍼를 추가합니다.

### 알림 API (미연동)

| 항목 | 상태 |
|------|------|
| UI | `NotificationListModal.tsx` |
| 데이터 | 빈 배열 — `// TODO: 실제 알림 데이터를 API에서 가져오는 로직` |
| 백엔드 | Swagger에 엔드포인트 확인 후 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) 해소 |

백엔드 계약 변경 시 **이 파일과 해당 `lib/apis/*.tsx`를 함께** 수정하세요.
