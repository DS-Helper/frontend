import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { getPosts, parsePostsListResponse } from "@/lib/apis/helpStory";
import type { PostListItem } from "@/types/helpStory";
import Pagination from "@/components/Pagination";
import classNames from "classnames/bind";
import styles from "../../styles/HelpStory.module.scss";
import Image from "next/image";

type SortType = "latest" | "popular";

const cn = classNames.bind(styles);

type Post = PostListItem;

const POST_PAGE_SIZE = 10;

/** 백엔??sort / sortBy 규약??맞춤 (?�요 ??값만 조정) */
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");

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
          console.error("?��??�린 ?�야�?조회 ?�패:", error);
          setPosts([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [currentPage, sortType]);

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

  // ?��?지 URL ?�효??검�?
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    // 'null'???�함??URL?� ?�효?��? ?�음
    if (url.includes('null')) return false;
    // 기본 URL ?�식 검�?
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

  /** ?�렬?� API(page ?�청??sort/sortBy) 기�? ???�기?�는 ?�재 ?�이지 ??검?�만 */
  const displayedPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q));
  }, [posts, searchQuery]);

  if (loading) {
    return (
      <div className={cn("container")}>
        <div className={cn("loading")}>
          <p>?��??�린 ?�야기�? 불러?�는 �?..</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <h1 className={cn("title")}>?��??�린 ?�야�?/h1>

        <div className={cn("listToolbar")}>
          <form
            className={cn("searchForm")}
            onSubmit={(e) => e.preventDefault()}
            aria-label="게시�??�목 검??
          >
            <input
              type="search"
              className={cn("searchInput")}
              placeholder="게시물의 ?�목???�력?�보?�요."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              enterKeyHint="search"
            />
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
          </form>
          <div className={cn("sortRow")} role="group" aria-label="?�렬">
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "latest" })}
              onClick={() => applySortType("latest")}
            >
              최신??
            </button>
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "popular" })}
              onClick={() => applySortType("popular")}
            >
              ?�기??
            </button>
          </div>
        </div>

        <ul className={cn("storyList")}>
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post) => (
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
          ) : posts.length > 0 ? (
            <div className={cn("emptyState")}>
              <p>검??결과가 ?�습?�다.</p>
            </div>
          ) : (
            <div className={cn("emptyState")}>
              <p>?�직 ?��??�린 ?�야기�? ?�습?�다.</p>
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
