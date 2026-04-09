export interface PostCommentRequest {
  boardId: string;
  parentId?: string | null;
  content: string;
}

export interface PatchCommentRequest {
  commentId: string;
  content: string;
}

export interface DeleteCommentRequest {
  commentId: string;
}

/** 백엔드 댓글 행 원본 (`data.content[]`) */
export interface CommentListItemDto {
  commentId: string;
  writerName: string;
  writerProfileImageUrl?: string | null;
  content: string;
  createdAt: string;
  parentId?: string | null;
  boardId?: string;
}

/** 커서 기반 페이지 데이터 (`data`) */
export interface CommentCursorPageData {
  content: CommentListItemDto[];
  hasNext: boolean;
  cursorId?: string | null;
  cursorTime?: string | null;
}

/** 댓글 목록 응답 엔벨롭 */
export interface GetCommentsResponse {
  success?: boolean;
  code?: { code: string; message: string; httpStatus: string };
  message?: string;
  data: CommentCursorPageData;
}

export interface CommentAuthor {
  id: string;
  name: string;
  profileImageUrl?: string | null;
}

export interface CommentItem {
  id: string;
  boardId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}