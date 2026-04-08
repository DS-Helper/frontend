import { BoardCategory, BoardPost, BoardPostDetail } from "@/types/board";

/** API 응답 항목을 BoardPost로 매핑 (백엔드 필드명이 다를 수 있음) */
export function mapItemToBoardPost(item: Record<string, unknown>): BoardPost {
  const author = (item.author as Record<string, unknown>) || {};
  return {
    id: String(item.id ?? item.boardId ?? ""),
    title: String(item.title ?? ""),
    content: String(item.content ?? ""),
    category: (item.category as BoardCategory) ?? "자유",
    likeCount: Number(item.likeCount ?? item.like_count ?? 0),
    commentCount: Number(item.commentCount ?? item.comment_count ?? 0),
    imageUrl:
      item.imageUrl != null
        ? String(item.imageUrl)
        : item.image_url != null
          ? String(item.image_url)
          : undefined,
    createdAt: String(item.createdAt ?? item.created_at ?? ""),
    author: {
      id: String(author.id ?? ""),
      name: String(author.name ?? ""),
      avatar: author.avatar != null ? String(author.avatar) : undefined,
    },
  };
}

export function mapItemToBoardPostDetail(item: Record<string, unknown>): BoardPostDetail {
  const base = mapItemToBoardPost(item);
  const contentFull = String(
    item.contentFull ?? item.content_full ?? base.content ?? ""
  );
  const viewCount = Number(item.viewCount ?? item.view_count ?? 0);
  return { ...base, contentFull, viewCount };
}
