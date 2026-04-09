import type { GetBoardsBoardItem, GetBoardsPageInfo } from "./board";

export interface AccountCode {
  code: string;
  message: string;
  httpStatus: string;
}

export interface AccountMyInfoData {
  name: string;
  email: string | null;
  birthyear: string;
  gender: string;
  phoneNumber: string;
  profileImageUrl: string;
}

export interface AccountMyInfoResponse {
  success: boolean;
  code: AccountCode;
  message: string;
  data: AccountMyInfoData;
}

/** PATCH /user/my-info — `dto` JSON 파트 본문 */
export interface PatchMyInfoDto {
  name: string;
  email: string;
  birthyear: string;
  gender: string;
  phoneNumber: string;
  removeProfileImage: boolean;
}

/** multipart: `dto`(application/json) + 선택 `profileImage`(binary) */
export interface PatchMyInfoRequest {
  dto: PatchMyInfoDto;
  profileImage?: File | null;
}

export interface PatchMyInfoResponse {
  success: boolean;
  code: AccountCode;
  message: string;
  data: AccountMyInfoData;
}

/** GET /boards/scrap 의 `page.sort` (Spring Page) */
export interface GetScrapsPageSort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

/** 스크랩 목록 페이지 메타 (`/boards` 목록과 동일 필드 + 선택 `sort`) */
export interface GetScrapsPageInfo extends GetBoardsPageInfo {
  sort?: GetScrapsPageSort;
}

/** GET /boards/scrap 의 `data` 본문 */
export interface GetScrapsData {
  boards: GetBoardsBoardItem[];
  page: GetScrapsPageInfo;
}

/** GET /boards/scrap 전체 응답 (axios `response.data`) */
export interface GetScrapsApiResponse {
  success: boolean;
  code: AccountCode;
  message: string;
  data: GetScrapsData;
}