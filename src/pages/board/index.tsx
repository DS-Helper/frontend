"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/Board.module.scss";
import filterStyles from "@/styles/BoardCategoryFilter.module.scss";
import searchIcon from "@/public/searchIcon.svg";
import BoardCategoryFilter from "@/components/BoardCategoryFilter";
import { BoardPost, BoardPostCategory, boardPostCategories } from "@/types/board";
import Image from "next/image";
import { getBoards, likeBoard, likeCount } from "@/lib/apis/board";
import {
  mapGetBoardsItemToBoardPost,
  parseGetBoardsPayload,
  parseLikeCountResponse,
} from "@/lib/board/mapBoardPost";
import { PiSquaresFourFill } from "react-icons/pi";

import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";
import boardPencilIcon from "@/public/boardPencilIcon.svg";
import Pagination from "@/components/Pagination";

const cn = classNames.bind(styles);
const cf = classNames.bind(filterStyles);

const POSTS_PER_PAGE = 10;

function getCategoryFromQuery(
  query: Record<string, string | string[] | undefined>
): BoardPostCategory | null {
  const c = query.category;
  if (typeof c !== "string") return null;
  return boardPostCategories.includes(c as BoardPostCategory) ? (c as BoardPostCategory) : null;
}

export default function BoardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<BoardPostCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategorySynced, setIsCategorySynced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [mobileCategoryDraft, setMobileCategoryDraft] = useState<BoardPostCategory | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const likeInFlightRef = useRef<Set<string>>(new Set());

  // URL 쿼리에서 카테고리 복원 (상세에서 돌아왔을 때)
  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = getCategoryFromQuery(router.query);
    setSelectedCategory(fromQuery);
    setIsCategorySynced(true);
  }, [router.isReady, router.query]);

  // 카테고리 변경 시 URL 반영 (다음에 상세 갔다 와도 유지되도록)
  const handleCategoryChange = (category: BoardPostCategory | null) => {
    setSelectedCategory(category);
    setBoardPosts([]);
    setHasMore(true);
    setCurrentPage(1);
    const query = category ? { category } : {};
    router.replace({ pathname: "/board", query }, undefined, { shallow: true });
  };

  const categoryForFetch = isCategorySynced ? selectedCategory : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 611);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setBoardPosts([]);
    setHasMore(true);
    setCurrentPage(1);
  }, [isMobile]);

  // API로 게시글 목록 조회
  useEffect(() => {
    if (!isCategorySynced) return;

    const fetchBoards = async () => {
      if (isMobile && currentPage > 1) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      const res = await getBoards({
        category: categoryForFetch ?? undefined,
        page: Math.max(0, currentPage - 1),
        size: POSTS_PER_PAGE,
      });

      setIsLoading(false);
      setIsFetchingMore(false);
      const parsed = res?.data != null ? parseGetBoardsPayload(res.data) : null;

      if (!parsed) {
        if (currentPage === 1) {
          setBoardPosts([]);
        }
        setHasMore(false);
        setTotalPages(1);
        return;
      }

      const { boards, page } = parsed;
      const mapped = boards.map(mapGetBoardsItemToBoardPost);
      const computedTotalPages = Math.max(1, Number(page.totalPages) || 1);
      setTotalPages(computedTotalPages);

      if (isMobile) {
        setBoardPosts((prev) => {
          if (currentPage === 1) return mapped;
          const next = [...prev];
          for (const post of mapped) {
            if (!next.some((p) => p.id === post.id)) next.push(post);
          }
          return next;
        });
        setHasMore(Boolean(page.hasNext) && mapped.length > 0);
      } else {
        setBoardPosts(mapped);
      }
    };

    fetchBoards();
  }, [isCategorySynced, categoryForFetch, currentPage, isMobile]);

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
    if (isMobile) return;
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages, isMobile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색은 이미 filteredPosts에서 처리됨
  };

  const handleLikeClick = useCallback(async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeInFlightRef.current.has(postId)) return;
    likeInFlightRef.current.add(postId);
    try {
      const toggleRes = await likeBoard(postId);
      if (toggleRes == null) return;
      const countRes = await likeCount(postId);
      const nextCount = parseLikeCountResponse(countRes?.data ?? null);
      if (nextCount == null) return;
      setBoardPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likeCount: nextCount } : p))
      );
    } finally {
      likeInFlightRef.current.delete(postId);
    }
  }, []);

  const openMobileCategorySheet = () => {
    setMobileCategoryDraft(selectedCategory);
    setIsMobileCategoryOpen(true);
  };

  const closeMobileCategorySheet = () => {
    setIsMobileCategoryOpen(false);
  };

  const applyMobileCategory = () => {
    handleCategoryChange(mobileCategoryDraft);
    setIsMobileCategoryOpen(false);
  };

  useEffect(() => {
    if (!isMobileCategoryOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileCategoryOpen]);

  useEffect(() => {
    if (!isMobile || !hasMore || isLoading || isFetchingMore) return;
    const target = loadMoreTriggerRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setCurrentPage((prev) => prev + 1);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isMobile, hasMore, isLoading, isFetchingMore]);

  return (
    <div className={cn("boardPage")}>
      <div className={cn("searchSection")}>
        <form onSubmit={handleSearch} className={cn("searchForm")}>
          <input
            type="text"
            placeholder="게시물의 제목을 입력해보세요."
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
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <main className={cn("mainContent")}>
          <div className={cf("mobileCategoryBar")}>
            <PiSquaresFourFill className={cf("mobileCategoryIcon")} />
            <button
              type="button"
              className={cf("mobileCategoryButton")}
              onClick={openMobileCategorySheet}
              aria-haspopup="dialog"
              aria-expanded={isMobileCategoryOpen}
              aria-controls="board-mobile-category-sheet"
            >
              카테고리
            </button>
          </div>
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
                      <button
                        type="button"
                        className={cn("metricLikeButton")}
                        aria-label="좋아요"
                        onClick={(e) => void handleLikeClick(e, post.id)}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Image src={heartIcon} alt="" width={24} height={24} className={cn("metricIcon")} aria-hidden />
                        <span className={cn("metricCount")}>{post.likeCount}</span>
                      </button>
                      <div className={cn("metricItem")}>
                        <Image src={commentIcon} alt="comment" width={24} height={24} className={cn("metricIcon")} />
                        <span className={cn("metricCount")}>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                  {post.imageUrl ? (
                    <div className={cn("postImage")} aria-hidden>
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={81}
                        height={81}
                        className={cn("image")}
                        unoptimized={post.imageUrl.startsWith("http")}
                      />
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className={cn("emptyState")}>
                <p>게시글이 없습니다.</p>
              </div>
            )}
          </div>
          {!isMobile && !isLoading && paginatedPosts.length > 0 && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
          {isMobile && (
            <div className={cn("mobileInfiniteFooter")} aria-live="polite">
              {isFetchingMore && <p className={cn("mobileInfiniteText")}>게시글을 더 불러오는 중...</p>}
              {!hasMore && boardPosts.length > 0 && (
                <p className={cn("mobileInfiniteText")}>모든 게시글을 불러왔습니다.</p>
              )}
              <div ref={loadMoreTriggerRef} className={cn("mobileInfiniteTrigger")} aria-hidden />
            </div>
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

      {isMobileCategoryOpen && (
        <div
          className={cf("mobileCategoryOverlay")}
          role="presentation"
          onClick={closeMobileCategorySheet}
        >
          <div
            id="board-mobile-category-sheet"
            className={cf("mobileCategorySheet")}
            role="dialog"
            aria-modal="true"
            aria-label="카테고리 선택"
            onClick={(e) => e.stopPropagation()}
          >
            <BoardCategoryFilter
              selectedCategory={mobileCategoryDraft}
              onCategoryChange={setMobileCategoryDraft}
            />
            <button
              type="button"
              className={cf("mobileCategoryConfirmButton", {
                mobileCategoryConfirmButtonActive: mobileCategoryDraft !== null,
              })}
              onClick={applyMobileCategory}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
