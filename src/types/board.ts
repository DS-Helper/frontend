// 게시판 카테고리 타입
export type BoardCategory =
  | '자유'
  | '일상'
  | '건강'
  | '육아'
  | '교육'
  | '상권'
  | '문화/여가';

export interface GetBoardsParams {
  category?: BoardCategory;
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: string;
}

export interface PostBoardDto {
  category: BoardCategory;
  title: string;
  content: string;
}

export interface PostBoardRequest {
  dto: PostBoardDto;
  images?: string[];
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
  category: BoardCategory;
  likeCount: number;
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

// 카테고리 목록
export const boardCategories: BoardCategory[] = [
  '자유',
  '일상',
  '건강',
  '육아',
  '교육',
  '상권',
  '문화/여가',
];

/** 글쓰기 화면 드롭다운 순서 */
export const boardWriteCategories: BoardCategory[] = [
  '자유',
  '일상',
  '건강',
  '육아',
  '교육',
  '상권',
  '문화/여가',
];
