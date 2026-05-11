/** 목록 API 한 건 (GET /posts 응답의 posts 항목) */
export interface PostListItem {
  postId: string;
  title: string;
  content: string;
  writerName: string;
  viewCount: number;
  imageUrls: string[];
  createdAt: string;
}

/** GET /posts 응답의 page 객체 (Spring Page 스타일) */
export interface PostsPageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  sort?: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}

/** GET /posts 본문 (axios response.data) */
export interface PostsListResponse {
  posts: PostListItem[];
  page: PostsPageMeta;
}

/** GET /posts 쿼리 (page는 보통 0부터) */
export interface GetPostsParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: string;
}
