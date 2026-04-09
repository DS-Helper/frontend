/** 게시글·글쓰기에 쓰는 주제 (전체 제외) */
export type BoardPostCategory =
  | '일상'
  | '건강'
  | '육아'
  | '교육'
  | '상권'
  | '문화/여가'
  | '기타';

/** 목록 필터 UI용 (`전체` 포함) */
export type BoardCategory = BoardPostCategory | '전체';

export interface GetBoardsParams {
  category?: BoardPostCategory;
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: string;
}

/** GET /boards 목록 한 행 (API 원본) */
export interface GetBoardsBoardItem {
  id: string;
  title: string;
  content: string;
  writerName: string;
  commentCount: number;
  likeCount: number;
  liked?: boolean;
  isLiked?: boolean;
  thumbNailUrl?: string | null;
  writerProfileImageUrl?: string | null;
  category?: BoardPostCategory | string;
  createdAt?: string;
}

/** GET /boards pagination 메타 */
export interface GetBoardsPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** GET /boards 의 `data` 본문 (`boards` + `page`) */
export interface GetBoardsData {
  boards: GetBoardsBoardItem[];
  page: GetBoardsPageInfo;
}

/** GET /boards 전체 응답 (axios `response.data`) */
export interface GetBoardsApiResponse {
  success: boolean;
  code?: { code: string; message: string; httpStatus: string };
  message?: string;
  data: GetBoardsData;
}

/** GET /board/:id 단건 `data` 본문 (목록 항목과 동일 필드 + 상세 전용) */
export interface GetBoardByIdData extends GetBoardsBoardItem {
  viewCount?: number;
  contentFull?: string;
  /** 본문 상단/대표 이미지 URL (있으면 썸네일보다 우선) */
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  liked?: boolean;
  isLiked?: boolean;
}

/** GET /board/:id 전체 응답 (axios `response.data`) */
export interface GetBoardByIdApiResponse {
  success: boolean;
  code?: { code: string; message: string; httpStatus: string };
  message?: string;
  data: GetBoardByIdData;
}

export interface PostBoardDto {
  category: BoardPostCategory;
  title: string;
  content: string;
}

/** POST /boards — `postBoard`가 FormData로 전송 (`dto`: JSON 파트, `images`: 파일 파트 반복) */
export interface PostBoardRequest {
  dto: PostBoardDto;
  images?: File[];
}

export interface PatchBoardDto {
  boardId: string;
  title?: string;
  content?: string;
  keepImageUrls?: string[];
}

export interface PatchBoardRequest {
  dto: PatchBoardDto;
  images?: string[];
}

// 게시글 타입
export interface BoardPost {
  id: string;
  title: string;
  content: string;
  category: BoardPostCategory;
  likeCount: number;
  liked?: boolean;
  commentCount: number;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// 게시글 상세 타입
export interface BoardPostDetail extends BoardPost {
  viewCount: number;
  contentFull: string; // 상세용 전체 본문
}

// 댓글 타입
export interface BoardComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string; // ISO 또는 상대시간 표시용
  parentId?: string; // 대댓글인 경우 부모 댓글 id
}

/** 글쓰기·API `category` 값 (전체 제외) */
export const boardPostCategories: BoardPostCategory[] = [
  '일상',
  '건강',
  '육아',
  '교육',
  '상권',
  '문화/여가',
  '기타',
];

/** 목록·필터 UI 순서 (맨 앞 `전체` = 필터 없음) */
export const boardCategories: BoardCategory[] = ['전체', ...boardPostCategories];

/** 글쓰기 드롭다운 순서 */
export const boardWriteCategories = boardPostCategories;
