import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getPosts, parsePostsListResponse } from "@/lib/apis/helpStory";
import type { PostListItem } from "@/types/helpStory";
import Pagination from "@/components/Pagination";
import classNames from "classnames/bind";
import styles from "@/styles/HelpStory.module.scss";
import Image from "next/image";

type SortType = "latest" | "popular";

const cn = classNames.bind(styles);

type Post = PostListItem;

const POST_PAGE_SIZE = 10;

/** 백엔드 sort / sortBy 규약에 맞춤 (필요 시 값만 조정) */
function sortParamsForType(sortType: SortType): { sort: string; sortBy: string } {
  if (sortType === "latest") {
    return { sort: "DESC", sortBy: "createdAt" };
  }
  return { sort: "DESC", sortBy: "viewCount" };
}

export default function HelpStoryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  /** 입력창 값 (검색 실행 전까지 API에 반영되지 않음) */
  const [searchQuery, setSearchQuery] = useState("");
  /** 마지막으로 API에 적용된 검색어 (trimmed, 빈 문자열이면 키워드 없음) */
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");
  /** 연속 클릭·이벤트로 동일 검색이 중복 실행되지 않도록 */
  const searchSubmitLockRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const { sort, sortBy } = sortParamsForType(sortType);
        const response = await getPosts({
          page: currentPage - 1,
          size: POST_PAGE_SIZE,
          sort,
          sortBy,
          ...(appliedKeyword.trim() !== ""
            ? { keyword: appliedKeyword.trim() }
            : {}),
        });

        if (cancelled) return;

        if (response?.data) {
          const { posts: postsData, page } = parsePostsListResponse(response.data);
          setPosts(postsData);

          if (page) {
            setTotalPages(page.totalPages >= 1 ? page.totalPages : 0);
            setTotalElements(page.totalElements);
            setCurrentPage(page.page + 1);
          } else {
            setTotalPages(1);
            setTotalElements(postsData.length);
          }
        } else {
          setPosts([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("도와드린 이야기 조회 실패:", error);
          setPosts([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          searchSubmitLockRef.current = false;
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [currentPage, sortType, appliedKeyword]);

  const applySortType = (next: SortType) => {
    if (next !== sortType) {
      setCurrentPage(1);
    }
    setSortType(next);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // 이미지 URL 유효성 검증
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    // 'null'이 포함된 URL은 유효하지 않음
    if (url.includes('null')) return false;
    // 기본 URL 형식 검증
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStoryClick = (postId: string) => {
    router.push(`/helpStory/${postId}`);
  };

  const runSearch = () => {
    const term = searchQuery.trim();
    if (term === appliedKeyword && currentPage === 1) return;
    if (searchSubmitLockRef.current) return;

    searchSubmitLockRef.current = true;
    if (term !== appliedKeyword) {
      setAppliedKeyword(term);
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  if (loading) {
    return (
      <div className={cn("container")}>
        <div className={cn("loading")}>
          <p>도와드린 이야기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <h1 className={cn("title")}>도와드린 이야기</h1>

        <div className={cn("listToolbar")}>
          <form
            className={cn("searchForm")}
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            aria-label="게시물 제목 검색"
          >
            <input
              type="search"
              className={cn("searchInput")}
              placeholder="게시물의 제목을 입력해보세요."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              enterKeyHint="search"
            />
            <button
              type="submit"
              className={cn("searchSubmitButton")}
              aria-label="검색"
            >
              <span className={cn("searchIconWrap")} aria-hidden>
                <svg
                  className={cn("searchIcon")}
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  focusable="false"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M22.2929 23.7071C22.6834 24.0976 23.3166 24.0976 23.7071 23.7071C24.0976 23.3166 24.0976 22.6834 23.7071 22.2929L23 23L22.2929 23.7071ZM19 19L18.2929 19.7071L22.2929 23.7071L23 23L23.7071 22.2929L19.7071 18.2929L19 19Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
          </form>
          <div className={cn("sortRow")} role="group" aria-label="정렬">
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "latest" })}
              onClick={() => applySortType("latest")}
            >
              최신순
            </button>
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "popular" })}
              onClick={() => applySortType("popular")}
            >
              인기순
            </button>
          </div>
        </div>

        <ul className={cn("storyList")}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <li
                key={post.postId} 
                className={cn("storyItem")}
                onClick={() => handleStoryClick(post.postId)}
              >
                <div className={cn("storyTextBox")}>
                  <p className={cn("storyTitle")}>{post.title}</p>
                  <div className={cn("storyContent")}>
                    <span className={cn("storyDate")}>{formatDate(post.createdAt)}</span>
                    <span className={cn("storyView")}>조회 {post.viewCount ?? 0}</span>
                  </div>
                </div>
                <div className={cn("storyImage")}>
                  {post.imageUrls && post.imageUrls.length > 0 && isValidImageUrl(post.imageUrls[0]) ? (
                    <Image
                      src={post.imageUrls[0]}
                      alt={post.title}
                      width={240}
                      height={180}
                      className={cn("image")}
                    />
                  ) : (
                    <div className={cn("placeholderImage")}></div>
                  )}
                </div>
              </li>
            ))
          ) : appliedKeyword.trim() !== "" ? (
            <div className={cn("emptyState")}>
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className={cn("emptyState")}>
              <p>아직 도와드린 이야기가 없습니다.</p>
            </div>
          )}
        </ul>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
