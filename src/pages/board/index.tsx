"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/Board.module.scss";
import searchIcon from "@/public/searchIcon.svg";
import BoardCategoryFilter from "@/components/BoardCategoryFilter";
import { BoardCategory, mockBoardPosts, boardCategories } from "@/types/board";
import Image from "next/image";

import heartIcon from "@/public/boardLikeGrey.svg";
import commentIcon from "@/public/boardCommentGrey.svg";
import boardPencilIcon from "@/public/boardPencilIcon.svg";
import Pagination from "@/components/Pagination";

const cn = classNames.bind(styles);

const POSTS_PER_PAGE = 10;

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

  // URL 쿼리에서 카테고리 복원 (상세에서 돌아왔을 때)
  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = getCategoryFromQuery(router.query);
    setSelectedCategory(fromQuery ?? "수다");
    setIsCategorySynced(true);
  }, [router.isReady, router.query]);

  // 카테고리 변경 시 URL 반영 (다음에 상세 갔다 와도 유지되도록)
  const handleCategoryChange = (category: BoardCategory | null) => {
    setSelectedCategory(category);
    const query = category ? { category } : {};
    router.replace({ pathname: "/board", query }, undefined, { shallow: true });
  };

  // URL 복원 전까지 기본값, 복원 후에는 선택값 사용
  const effectiveCategory = isCategorySynced ? (selectedCategory ?? "수다") : "수다";

  // 필터링된 게시글 목록
  const filteredPosts = useMemo(() => {
    let posts = mockBoardPosts;

    if (effectiveCategory) {
      posts = posts.filter((post) => post.category === effectiveCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
    }

    return posts;
  }, [effectiveCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

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
            selectedCategory={effectiveCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <main className={cn("mainContent")}>
          <div className={cn("postList")}>
            {paginatedPosts.length > 0 ? (
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
                  <div className={cn("postImage")}>
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className={cn("image")}
                      />
                    ) : (
                      <div className={cn("imagePlaceholder")}></div>
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
          {filteredPosts.length > 0 && (
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
