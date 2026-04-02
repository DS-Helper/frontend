import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import scrapStyles from "@/styles/Scrap.module.scss";
import { handleLogout } from "@/lib/utils/logout";
import { BoardPost } from "@/types/board";
import { getBoards, getBoardById } from "@/lib/apis/board";
import { mapItemToBoardPost } from "@/lib/board/mapBoardPost";
import { readScrapIds } from "@/lib/board/scrapStorage";
import heartIcon from "@/public/boardLikeGrey.svg";
import commentIcon from "@/public/boardCommentGrey.svg";

const cn = classNames.bind(styles);
const scrapCn = classNames.bind(scrapStyles);

const FETCH_SIZE = 100;

function parseBoardListPayload(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const dataObj =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  const rawContent = dataObj.content ?? dataObj.data;
  return Array.isArray(rawContent) ? (rawContent as Record<string, unknown>[]) : [];
}

export default function ScrapPage() {
  const router = useRouter();
  const [scrapPosts, setScrapPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScrapPosts = useCallback(async () => {
    const scrapIds = readScrapIds();
    if (scrapIds.length === 0) {
      setScrapPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await getBoards({ page: 1, size: FETCH_SIZE });

    if (!res?.data) {
      setScrapPosts([]);
      setIsLoading(false);
      return;
    }

    const content = parseBoardListPayload(res.data);
    const mapped = content.map((item) => mapItemToBoardPost(item));
    const byId = new Map(mapped.map((p) => [p.id, p]));

    const missingIds = scrapIds.filter((id) => !byId.has(id));
    await Promise.all(
      missingIds.map(async (boardId) => {
        const r = await getBoardById(boardId);
        const d = r?.data;
        if (d && typeof d === "object" && !Array.isArray(d)) {
          const post = mapItemToBoardPost(d as Record<string, unknown>);
          if (post.id) byId.set(post.id, post);
        }
      })
    );

    const ordered = scrapIds
      .map((id) => byId.get(id))
      .filter((p): p is BoardPost => p != null);

    setScrapPosts(ordered);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadScrapPosts();
  }, [loadScrapPosts]);

  useEffect(() => {
    const onUpdate = () => {
      loadScrapPosts();
    };
    window.addEventListener("boardScrapUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("boardScrapUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
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
      <aside className={cn("sidebar")}>
        <ul className={cn("navList")}>
          <li
            className={cn("navItem")}
            onClick={() => router.push("/account")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/account")}
            role="button"
            tabIndex={0}
          >
            프로필
          </li>
          <li
            className={cn("navItem", "navItemActive")}
            onClick={() => {}}
            onKeyDown={(e) => e.key === "Enter" && (() => {})()}
            role="button"
            tabIndex={0}
          >
            스크랩
          </li>
          <li
            className={cn("navItem")}
            onClick={handleLogoutClick}
            onKeyDown={(e) => e.key === "Enter" && handleLogoutClick()}
            role="button"
            tabIndex={0}
          >
            로그아웃
          </li>
        </ul>
      </aside>

      <main className={cn("main", scrapCn("scrapMain"))}>
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
                <div className={scrapCn("postImage")} aria-hidden>
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={81}
                      height={81}
                      className={scrapCn("image")}
                      unoptimized={post.imageUrl.startsWith("http")}
                    />
                  ) : (
                    <div className={scrapCn("imagePlaceholder")} />
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className={scrapCn("emptyState")}>
              <p>스크랩한 게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
