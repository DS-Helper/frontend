import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import { PiBookmarkSimple } from "react-icons/pi";
import styles from "@/styles/Account.module.scss";
import scrapStyles from "@/styles/Scrap.module.scss";
import { handleLogout } from "@/lib/utils/logout";
import { BoardPost } from "@/types/board";
import { getScraps } from "@/lib/apis/account";
import { mapGetBoardsItemToBoardPost, parseGetBoardsPayload } from "@/lib/board/mapBoardPost";

import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";
import AccountSideBar from "@/components/AccountSideBar";

const cn = classNames.bind(styles);
const scrapCn = classNames.bind(scrapStyles);

export default function ScrapPage() {
  const router = useRouter();
  const [scrapPosts, setScrapPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScrapPosts = useCallback(async () => {
    setIsLoading(true);
    const res = await getScraps();
    if (!res?.data) {
      setScrapPosts([]);
      setIsLoading(false);
      return;
    }
    const parsed = parseGetBoardsPayload(res.data);
    if (!parsed) {
      setScrapPosts([]);
      setIsLoading(false);
      return;
    }
    setScrapPosts(parsed.boards.map(mapGetBoardsItemToBoardPost));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadScrapPosts();
  }, [loadScrapPosts]);

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
      <AccountSideBar activeTab="scrap" onLogout={handleLogoutClick} />

      <main className={cn("main", scrapCn("scrapMain"))}>
        <div className={scrapCn("scrapBoardShell")}>
          <div className={scrapCn("scrapMainContent")}>
            <div className={scrapCn("postList")}>
              {isLoading ? (
                <div className={scrapCn("emptyState")}>
                  <p>목록을 불러오는 중...</p>
                </div>
              ) : scrapPosts.length > 0 ? (
                scrapPosts.map((post) => (
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
                  <p>스크랩한 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
