import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { getPosts } from "@/lib/apis/helpStory";
import classNames from "classnames/bind";
import styles from "@/styles/HelpStory.module.scss";
import Image from "next/image";

type SortType = "latest" | "popular";

const cn = classNames.bind(styles);

interface Post {
  postId: string;
  title: string;
  content: string;
  writerName: string;
  imageUrls: string[];
  createdAt: string;
  viewCount?: number;
}

export default function HelpStoryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      
      console.log('API 응답:', response); // 디버깅용
      
      if (response && response.data) {
        // API 응답 구조: response.data.posts 배열
        const postsData = response.data.posts || [];
        const totalPagesCount = response.data.totalPages || 1;
        
        console.log('포스트 데이터:', postsData); // 디버깅용
        
        setPosts(postsData);
        setTotalPages(totalPagesCount);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('도와드린 이야기 조회 실패:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
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

  const displayedPosts = useMemo(() => {
    let list = [...posts];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (sortType === "latest") {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      list.sort((a, b) => {
        const views = (b.viewCount ?? 0) - (a.viewCount ?? 0);
        if (views !== 0) return views;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return list;
  }, [posts, searchQuery, sortType]);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn("pageButton", { active: i === currentPage })}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={cn("pagination")}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn("pageButton", "navButton")}
        >
          &lt;
        </button>
        {pages}
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn("pageButton", "navButton")}
        >
          &gt;
        </button>
      </div>
    );
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
            onSubmit={(e) => e.preventDefault()}
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
          <div className={cn("sortRow")} role="group" aria-label="정렬">
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "latest" })}
              onClick={() => setSortType("latest")}
            >
              최신순
            </button>
            <button
              type="button"
              className={cn("sortButton", { sortButtonActive: sortType === "popular" })}
              onClick={() => setSortType("popular")}
            >
              인기순
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
                    <div className={cn("placeholderImage")}>
                      <span>이미지 없음</span>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : posts.length > 0 ? (
            <div className={cn("emptyState")}>
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className={cn("emptyState")}>
              <p>아직 도와드린 이야기가 없습니다.</p>
            </div>
          )}
        </ul>

        {totalPages > 1 && renderPagination()}
      </main>
    </div>
  );
}
