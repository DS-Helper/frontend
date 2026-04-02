"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/Board.module.scss";
import searchIcon from "@/public/searchIcon.svg";
import BoardCategoryFilter from "@/components/BoardCategoryFilter";
import { BoardCategory, boardCategories, BoardPost } from "@/types/board";
import Image from "next/image";
import { getBoards } from "@/lib/apis/board";

import heartIcon from "@/public/boardLikeGrey.svg";
import commentIcon from "@/public/boardCommentGrey.svg";
import boardPencilIcon from "@/public/boardPencilIcon.svg";
import Pagination from "@/components/Pagination";

const cn = classNames.bind(styles);

const POSTS_PER_PAGE = 10;

/** API 응답 항목을 BoardPost로 매핑 (백엔드 필드명이 다를 수 있음) */
function mapItemToBoardPost(item: Record<string, unknown>): BoardPost {
  const author = (item.author as Record<string, unknown>) || {};
  return {
    id: String(item.id ?? item.boardId ?? ""),
    title: String(item.title ?? ""),
    content: String(item.content ?? ""),
    category: (item.category as BoardCategory) ?? "기타",
    likeCount: Number(item.likeCount ?? item.like_count ?? 0),
    commentCount: Number(item.commentCount ?? item.comment_count ?? 0),
    imageUrl: item.imageUrl != null ? String(item.imageUrl) : (item.image_url != null ? String(item.image_url) : undefined),
    createdAt: String(item.createdAt ?? item.created_at ?? ""),
    author: {
      id: String(author.id ?? ""),
      name: String(author.name ?? ""),
      avatar: author.avatar != null ? String(author.avatar) : undefined,
    },
  };
}

function getCategoryFromQuery(
  query: Record<string, string | string[] | undefined>
): BoardCategory | null {
  const c = query.category;
  if (typeof c !== "string") return null;
  return boardCategories.includes(c as BoardCategory) ? (c as BoardCategory) : null;
}

export default function BoardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategorySynced, setIsCategorySynced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // URL 쿼리에서 카테고리 복원 (상세에서 돌아왔을 때)
  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = getCategoryFromQuery(router.query);
    setSelectedCategory(fromQuery ?? null);
    setIsCategorySynced(true);
  }, [router.isReady, router.query]);

  // 카테고리 변경 시 URL 반영 (다음에 상세 갔다 와도 유지되도록)
  const handleCategoryChange = (category: BoardCategory | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const query = category ? { category } : {};
    router.replace({ pathname: "/board", query }, undefined, { shallow: true });
  };

  // URL 복원 전까지 기본값, 복원 후에는 선택값 사용
  const effectiveCategory = isCategorySynced ? (selectedCategory ?? "수다") : "수다";

  // API로 게시글 목록 조회
  useEffect(() => {
    if (!isCategorySynced) return;

    const fetchBoards = async () => {
      setIsLoading(true);
      const res = await getBoards({
        category: effectiveCategory === "수다" ? undefined : (effectiveCategory as BoardCategory),
        page: currentPage,
        size: POSTS_PER_PAGE,
      });

      setIsLoading(false);
      if (!res?.data) {
        setBoardPosts([]);
        setTotalPages(1);
        return;
      }

      const data = res.data;
      const dataObj = data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
      const rawContent = Array.isArray(data) ? data : (dataObj.content ?? dataObj.data);
      const content = Array.isArray(rawContent) ? rawContent : [];
      const total = Number(dataObj.totalPages ?? dataObj.total_pages ?? 1);
      const totalElements = dataObj.totalElements ?? dataObj.total_elements;
      const computedTotalPages =
        totalElements != null
          ? Math.max(1, Math.ceil(Number(totalElements) / POSTS_PER_PAGE))
          : total;

      setBoardPosts(content.map((item) => mapItemToBoardPost(item as Record<string, unknown>)));
      setTotalPages(Math.max(1, computedTotalPages));
    };

    fetchBoards();
  }, [isCategorySynced, effectiveCategory, currentPage]);

  // 검색어로 현재 페이지 목록만 클라이언트 필터 (서버 검색은 API 지원 시 연동)
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return boardPosts;
    const q = searchQuery.toLowerCase();
    return boardPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)
    );
  }, [boardPosts, searchQuery]);

  const paginatedPosts = filteredPosts;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색은 이미 filteredPosts에서 처리됨
  };

  return (
    <div className={cn("boardPage")}>
      <div className={cn("searchSection")}>
        <form onSubmit={handleSearch} className={cn("searchForm")}>
          <input
            type="text"
            placeholder="관심사를 입력해주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("searchInput")}
          />
          <button type="submit" className={cn("searchButton")}>
            <Image src={searchIcon} alt="search" width={30} height={30} className={cn("searchIcon")} />
          </button>
        </form>
      </div>

      <div className={cn("boardContainer")}>
        <aside className={cn("sidebar")}>
          <BoardCategoryFilter
            selectedCategory={effectiveCategory === "수다" ? null : effectiveCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <main className={cn("mainContent")}>
          <div className={cn("postList")}>
            {isLoading ? (
              <div className={cn("emptyState")}>
                <p>목록을 불러오는 중...</p>
              </div>
            ) : paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <article
                  key={post.id}
                  className={cn("postItem")}
                  onClick={() => router.push(`/board/${post.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/board/${post.id}`);
                    }
                  }}
                >
                  <div className={cn("postContent")}>
                    <h3 className={cn("postTitle")}>{post.title}</h3>
                    <p className={cn("postText")}>{post.content}</p>
                    <div className={cn("postMetrics")}>
                      <div className={cn("metricItem")}>
                        <Image src={heartIcon} alt="heart" width={24} height={24} className={cn("metricIcon")} />
                        <span className={cn("metricCount")}>{post.likeCount}</span>
                      </div>
                      <div className={cn("metricItem")}>
                        <Image src={commentIcon} alt="comment" width={24} height={24} className={cn("metricIcon")} />
                        <span className={cn("metricCount")}>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn("postImage")} aria-hidden>
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={81}
                        height={81}
                        className={cn("image")}
                        unoptimized={post.imageUrl.startsWith("http")}
                      />
                    ) : (
                      <div className={cn("imagePlaceholder")} />
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className={cn("emptyState")}>
                <p>게시글이 없습니다.</p>
              </div>
            )}
          </div>
          {!isLoading && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>

      <button
        type="button"
        className={cn("writeFab")}
        onClick={() => router.push("/board/write")}
        aria-label="글쓰기"
      >
        <Image src={boardPencilIcon} alt="글쓰기" className={cn("writeFabIcon")} width={36} height={36} />
      </button>
    </div>
  );
}
