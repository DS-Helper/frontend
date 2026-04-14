import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import scrapStyles from "@/styles/Scrap.module.scss";
import AccountSideBar from "@/components/AccountSideBar";
import { handleLogout } from "@/lib/utils/logout";
import { BoardPost } from "@/types/board";
import { getBoardMe } from "@/lib/apis/board";
import { mapGetBoardsItemToBoardPost } from "@/lib/board/mapBoardPost";
import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";

const cn = classNames.bind(styles);
const scrapCn = classNames.bind(scrapStyles);

export default function MyPostsPage() {
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMyPosts = useCallback(async () => {
    setIsLoading(true);
    const res = await getBoardMe();
    if (!res?.data) {
      setMyPosts([]);
      setIsLoading(false);
      return;
    }
    const items = res.data.data?.content;
    if (!Array.isArray(items)) {
      setMyPosts([]);
      setIsLoading(false);
      return;
    }
    setMyPosts(items.map(mapGetBoardsItemToBoardPost));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      router.push("/");
    }
  };

  return (
    <div className={cn("wrapper")}>
      <AccountSideBar activeTab="myPosts" onLogout={handleLogoutClick} />

      <main className={cn("main", scrapCn("scrapMain"))}>
        <div className={scrapCn("scrapBoardShell")}>
          <div className={scrapCn("scrapMainContent")}>
            <div className={scrapCn("postList")}>
              {isLoading ? (
                <div className={scrapCn("emptyState")}>
                  <p>목록을 불러오는 중...</p>
                </div>
              ) : myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <article
                    key={post.id}
                    className={scrapCn("postItem")}
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
                    <div className={scrapCn("postContent")}>
                      <h3 className={scrapCn("postTitle")}>{post.title}</h3>
                      <p className={scrapCn("postText")}>{post.content}</p>
                      <div className={scrapCn("postMetrics")}>
                        <div className={scrapCn("metricItem")}>
                          <Image
                            src={heartIcon}
                            alt="좋아요"
                            width={24}
                            height={24}
                            className={scrapCn("metricIcon")}
                          />
                          <span className={scrapCn("metricCount")}>{post.likeCount}</span>
                        </div>
                        <div className={scrapCn("metricItem")}>
                          <Image
                            src={commentIcon}
                            alt="댓글"
                            width={24}
                            height={24}
                            className={scrapCn("metricIcon")}
                          />
                          <span className={scrapCn("metricCount")}>{post.commentCount}</span>
                        </div>
                      </div>
                    </div>
                    {post.imageUrl ? (
                      <div className={scrapCn("postImage")} aria-hidden>
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          width={81}
                          height={81}
                          className={scrapCn("image")}
                          unoptimized={post.imageUrl.startsWith("http")}
                        />
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className={scrapCn("emptyState")}>
                  <p>작성한 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
