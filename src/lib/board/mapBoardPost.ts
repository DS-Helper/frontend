import {
  BoardPost,
  BoardPostCategory,
  BoardPostDetail,
  boardPostCategories,
  GetBoardsBoardItem,
  GetBoardsData,
  GetBoardsPageInfo,
} from "@/types/board";

/** axios 응답 본문에서 `boards` / `page` 추출 (래핑 `{ data: { boards, page } }` 및 평평한 형태 모두 시도) */
export function parseGetBoardsPayload(body: unknown): GetBoardsData | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  const inner =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const boardsRaw = inner.boards;
  const pageRaw = inner.page;
  if (!Array.isArray(boardsRaw) || pageRaw == null || typeof pageRaw !== "object" || Array.isArray(pageRaw)) {
    return null;
  }

  return {
    boards: boardsRaw as GetBoardsBoardItem[],
    page: pageRaw as GetBoardsPageInfo,
  };
}

/** GET 단건 /board/:id 등 — `{ success, data: { ... } }` 또는 평면 객체에서 게시글 레코드만 추출 */
export function parseBoardRecordFromApi(body: unknown): Record<string, unknown> | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  if (!("data" in root)) {
    return root;
  }
  const d = root.data;
  if (d == null || typeof d !== "object" || Array.isArray(d)) {
    return null;
  }
  return d as Record<string, unknown>;
}

export function mapGetBoardsItemToBoardPost(item: GetBoardsBoardItem): BoardPost {
  const cat = item.category;
  const category: BoardPostCategory =
    typeof cat === "string" && boardPostCategories.includes(cat as BoardPostCategory)
      ? (cat as BoardPostCategory)
      : "기타";

  const thumb = item.thumbNailUrl;
  const profile = item.writerProfileImageUrl;

  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    content: String(item.content ?? ""),
    category,
    likeCount: Number(item.likeCount ?? 0),
    commentCount: Number(item.commentCount ?? 0),
    imageUrl: thumb != null && String(thumb).trim() !== "" ? String(thumb) : undefined,
    createdAt: String(item.createdAt ?? ""),
    author: {
      id: "",
      name: String(item.writerName ?? ""),
      avatar: profile != null && String(profile).trim() !== "" ? String(profile) : undefined,
    },
  };
}

/** API 응답 항목을 BoardPost로 매핑 (백엔드 필드명이 다를 수 있음) */
export function mapItemToBoardPost(item: Record<string, unknown>): BoardPost {
  const author = (item.author as Record<string, unknown>) || {};
  const writerName = item.writerName != null ? String(item.writerName) : "";
  const writerAvatar =
    item.writerProfileImageUrl ?? item.writer_profile_image_url ?? null;
  const thumb = item.thumbNailUrl ?? item.thumb_nail_url ?? null;
  const primaryImage =
    item.imageUrl != null && String(item.imageUrl).trim() !== ""
      ? String(item.imageUrl)
      : item.image_url != null && String(item.image_url).trim() !== ""
        ? String(item.image_url)
        : thumb != null && String(thumb).trim() !== ""
          ? String(thumb)
          : undefined;
  const authorAvatar =
    author.avatar != null && String(author.avatar).trim() !== ""
      ? String(author.avatar)
      : writerAvatar != null && String(writerAvatar).trim() !== ""
        ? String(writerAvatar)
        : undefined;
  return {
    id: String(item.id ?? item.boardId ?? ""),
    title: String(item.title ?? ""),
    content: String(item.content ?? ""),
    category:
      typeof item.category === "string" &&
      boardPostCategories.includes(item.category as BoardPostCategory)
        ? (item.category as BoardPostCategory)
        : "기타",
    likeCount: Number(item.likeCount ?? item.like_count ?? 0),
    commentCount: Number(item.commentCount ?? item.comment_count ?? 0),
    imageUrl: primaryImage,
    createdAt: String(item.createdAt ?? item.created_at ?? ""),
    author: {
      id: String(author.id ?? item.writerId ?? item.writer_id ?? ""),
      name: String(author.name ?? writerName ?? ""),
      avatar: authorAvatar,
    },
  };
}

/** POST 좋아요 토글 응답에서 `likeCount` / `liked` 추출 (`data` 래핑 대응) */
export function parseLikeToggleResponse(body: unknown): {
  likeCount?: number;
  liked?: boolean;
} {
  if (body == null || typeof body !== "object") return {};
  const root = body as Record<string, unknown>;
  const inner =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const likeRaw = inner.likeCount ?? inner.like_count;
  const likedRaw = inner.liked ?? inner.isLiked;
  const likeCount =
    likeRaw != null && Number.isFinite(Number(likeRaw)) ? Number(likeRaw) : undefined;
  let liked: boolean | undefined;
  if (typeof likedRaw === "boolean") liked = likedRaw;
  else if (likedRaw === "true") liked = true;
  else if (likedRaw === "false") liked = false;
  return { likeCount, liked };
}

/** GET /board/:id/like/count 등 — 응답에서 좋아요 개수만 추출 */
export function parseLikeCountResponse(body: unknown): number | null {
  if (body == null) return null;
  if (typeof body === "number" && Number.isFinite(body)) return body;
  if (typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  const rawData = root.data;
  if (typeof rawData === "number" && Number.isFinite(rawData)) return rawData;
  const nest =
    rawData != null && typeof rawData === "object" && !Array.isArray(rawData)
      ? (rawData as Record<string, unknown>)
      : root;
  const v =
    nest.likeCount ??
    nest.like_count ??
    nest.count ??
    nest.totalCount ??
    nest.totalLikes;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mapItemToBoardPostDetail(item: Record<string, unknown>): BoardPostDetail {
  const base = mapItemToBoardPost(item);
  const contentFull = String(
    item.contentFull ?? item.content_full ?? item.content ?? base.content ?? ""
  );
  const viewCount = Number(item.viewCount ?? item.view_count ?? 0);
  return { ...base, contentFull, viewCount };
}
