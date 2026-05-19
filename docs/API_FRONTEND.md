# API (프론트엔드 기준)

백엔드 **전체 스펙·Swagger**는 [DS-Helper/backend](https://github.com/DS-Helper/backend) 저장소를 기준으로 합니다.  
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

## 에러 처리 공통

- `401`: 세션 초기화 (`resetUserSession`)
- `403`: 예약 API가 아니면 권한 alert 가능
- 호출 실패 시 각 API 함수가 `null` 또는 `catch` 후 UI alert — 페이지별 처리

백엔드 계약 변경 시 **이 파일과 해당 `lib/apis/*.tsx`를 함께** 수정하세요.
