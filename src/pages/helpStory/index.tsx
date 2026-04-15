import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getPosts } from "@/lib/apis/helpStory";
import classNames from "classnames/bind";
import styles from "@/styles/HelpStory.module.scss";
import Image from "next/image";

const cn = classNames.bind(styles);

interface Post {
  postId: string;
  title: string;
  content: string;
  writerName: string;
  imageUrls: string[];
  createdAt: string;
}

export default function HelpStoryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        
        <div className={cn("storyList")}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.postId} 
                className={cn("storyItem")}
                onClick={() => handleStoryClick(post.postId)}
              >
                <div className={cn("storyContent")}>
                  <h3 className={cn("storyTitle")}>{post.title}</h3>
                  <span className={cn("storyDate")}>{formatDate(post.createdAt)}</span>
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
              </div>
            ))
          ) : (
            <div className={cn("emptyState")}>
              <p>아직 도와드린 이야기가 없습니다.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && renderPagination()}
      </main>
    </div>
  );
}
