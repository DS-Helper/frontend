"use client";

import { useState, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/Board.module.scss";
import searchIcon from "@/public/searchIcon.svg";
import BoardCategoryFilter from "@/components/BoardCategoryFilter";
import { BoardPost, BoardCategory, mockBoardPosts } from "@/types/board";
import Image from "next/image";

import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";

const cn = classNames.bind(styles);

export default function BoardPage() {
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | null>('수다');
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 게시글 목록
  const filteredPosts = useMemo(() => {
    let posts = mockBoardPosts;

    if (selectedCategory) {
      posts = posts.filter((post) => post.category === selectedCategory);
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
  }, [selectedCategory, searchQuery]);

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
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </aside>

        <main className={cn("mainContent")}>
          <div className={cn("postList")}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article key={post.id} className={cn("postItem")}>
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
        </main>
      </div>
    </div>
  );
}
