import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import scrapStyles from "@/styles/Scrap.module.scss";
import { handleLogout } from "@/lib/utils/logout";
import { mockBoardPosts } from "@/types/board";
import heartIcon from "@/public/boardLikeGrey.svg";
import commentIcon from "@/public/boardCommentGrey.svg";

const cn = classNames.bind(styles);
const scrapCn = classNames.bind(scrapStyles);

// 북마크된 게시글 ID 목록 (추후 API/스토어 연동)
const MOCK_SCRAP_IDS = ["1", "2", "3", "4"];

export default function ScrapPage() {
  const router = useRouter();
  const scrapPosts = mockBoardPosts.filter((post) =>
    MOCK_SCRAP_IDS.includes(post.id)
  );

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
            onKeyDown={(e) =>
              e.key === "Enter" && router.push("/account")
            }
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
          {scrapPosts.length > 0 ? (
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
                      <span className={scrapCn("metricCount")}>
                        {post.likeCount}
                      </span>
                    </div>
                    <div className={scrapCn("metricItem")}>
                      <Image
                        src={commentIcon}
                        alt="댓글"
                        width={24}
                        height={24}
                        className={scrapCn("metricIcon")}
                      />
                      <span className={scrapCn("metricCount")}>
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
                {post.imageUrl && (
                  <div className={scrapCn("postImage")}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className={scrapCn("image")}
                    />
                  </div>
                )}
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
