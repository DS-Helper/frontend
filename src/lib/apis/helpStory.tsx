import { instance } from "./axios";
import type { AxiosResponse } from "axios";
import type { GetPostsParams, PostListItem, PostsListResponse, PostsPageMeta } from "@/types/helpStory";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function normalizePostsPageMeta(raw: Record<string, unknown>): PostsPageMeta {
  const sortRaw = raw.sort;
  const sort =
    isRecord(sortRaw) &&
    typeof sortRaw.sorted === "boolean" &&
    typeof sortRaw.empty === "boolean" &&
    typeof sortRaw.unsorted === "boolean"
      ? {
          sorted: sortRaw.sorted,
          empty: sortRaw.empty,
          unsorted: sortRaw.unsorted,
        }
      : undefined;

  const totalPagesNum = Number(raw.totalPages);
  const totalElementsNum = Number(raw.totalElements);
  const sizeNum = Number(raw.size);
  const pageIndexNum = Number(raw.page);

  return {
    page: Number.isFinite(pageIndexNum) ? Math.trunc(pageIndexNum) : 0,
    size: Number.isFinite(sizeNum) && sizeNum >= 1 ? Math.trunc(sizeNum) : 10,
    totalElements: Number.isFinite(totalElementsNum) ? Math.trunc(totalElementsNum) : 0,
    totalPages: Number.isFinite(totalPagesNum) && totalPagesNum >= 0 ? Math.trunc(totalPagesNum) : 0,
    first: Boolean(raw.first),
    last: Boolean(raw.last),
    hasNext: Boolean(raw.hasNext),
    hasPrevious: Boolean(raw.hasPrevious),
    sort,
  };
}

/**
 * GET /posts 본문 파싱: { posts, page }
 * envelope `{ data: { posts, page } }`만 추가로 허용.
 */
export function parsePostsListResponse(body: unknown): {
  posts: PostListItem[];
  page: PostsPageMeta | null;
} {
  if (!isRecord(body)) {
    return { posts: [], page: null };
  }

  const inner = isRecord(body.data) ? (body.data as Record<string, unknown>) : null;
  const root = inner != null && Array.isArray(inner.posts) ? inner : body;

  const postsRaw = root.posts;
  const posts = Array.isArray(postsRaw) ? (postsRaw as PostListItem[]) : [];

  const pageRaw = root.page;
  if (!isRecord(pageRaw)) {
    return { posts, page: null };
  }

  return { posts, page: normalizePostsPageMeta(pageRaw) };
}

/** 홈 등 페이지 메타 없이 목록만 필요할 때 */
export function parsePostsListBody(body: unknown): { posts: PostListItem[]; totalPages: number } {
  const { posts, page } = parsePostsListResponse(body);
  const totalPages =
    page != null && page.totalPages >= 1
      ? page.totalPages
      : page != null && page.totalElements > 0 && page.size >= 1
        ? Math.max(1, Math.ceil(page.totalElements / page.size))
        : 1;
  return { posts, totalPages };
}

export const getPosts = async (
  params?: GetPostsParams
): Promise<AxiosResponse<PostsListResponse> | null> => {
  try {
    const res = await instance.get<PostsListResponse>("/posts", { params });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postPost = async (data: any) => {
  try {
    const res = await instance.post("/posts", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getPost = async (postId: string) => {
  try {
    const res = await instance.get(`/posts/${postId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const putPost = async (data: any) => {
  try {
    const res = await instance.put(`/posts`, data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};
