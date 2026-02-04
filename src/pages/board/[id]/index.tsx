"use client";

import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/BoardDetail.module.scss";
import Image from "next/image";
import {
  getBoardPostDetail,
  getBoardComments,
  BoardPostDetail,
  BoardComment,
} from "@/types/board";
import { useUserStore } from "@/lib/store/userStore";
import shareIcon from "@/public/boardShareIcon.svg";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";
import bookmarkIcon from "@/public/boardBookmarkIcon.svg";
import bookmarkActiveIcon from "@/public/boardBookmarkFilledIcon.svg";
import likeActiveIcon from "@/public/boardLikeFilledIcon.svg";

const DEFAULT_AVATAR = "/userIcon.svg";

const cn = classNames.bind(styles);

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserStore();
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // 작성자와 로그인 사용자 동일인물 여부 (id 또는 name으로 비교)
  const isAuthor = Boolean(
    user && post && (user.id === post.author.id || user.name === post.author.name)
  );

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const detail = getBoardPostDetail(id);
    if (detail) {
      setPost(detail);
      setComments(getBoardComments(id));
    } else {
      router.push("/board");
    }
  }, [id, router]);

  // 공유 기능 (helpStory 상세와 동일)
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const isWeb = typeof window !== "undefined" && window.innerWidth >= 661;

    if (isWeb) {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        }
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
        alert("링크 복사에 실패했습니다.");
      }
    } else {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: post?.title || "커뮤니티 게시글",
            text: post?.contentFull || "",
            url: shareUrl,
          });
        } catch (error: unknown) {
          const err = error as { name?: string };
          if (err.name !== "AbortError") {
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }
            } catch (clipboardErr) {
              console.error("클립보드 복사 실패:", clipboardErr);
            }
          }
        }
      } else {
        try {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          } else {
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          }
        } catch (err) {
          console.error("클립보드 복사 실패:", err);
          alert("링크 복사에 실패했습니다.");
        }
      }
    }
  };

  const handleEdit = () => {
    setShowMoreMenu(false);
    // TODO: 수정 페이지로 이동 또는 수정 모달
    alert("수정 기능은 준비 중입니다.");
  };

  const handleDelete = () => {
    setShowMoreMenu(false);
    if (window.confirm("정말 삭제하시겠습니까?")) {
      // TODO: 삭제 API 호출 후 목록으로 이동
      router.push("/board");
    }
  };

  const handleReport = () => {
    setShowMoreMenu(false);
    // TODO: 신고 모달 또는 API
    alert("신고 기능은 준비 중입니다.");
  };

  if (!post) {
    return (
      <div className={cn("boardDetailPage")}>
        <div className={cn("loading")}>로딩 중...</div>
      </div>
    );
  }

  const renderComment = (comment: BoardComment, isReply?: boolean) => (
    <div
      key={comment.id}
      className={cn("commentItem", { isReply })}
    >
      <div className={cn("commentBody")}>
        <div className={cn("commentAvatar")}>
          <Image
            src={comment.author.avatar ?? DEFAULT_AVATAR}
            alt={`${comment.author.name} 프로필`}
            width={38}
            height={38}
          />
        </div>
        <div className={cn("commentMeta")}>
          <span className={cn("commentAuthor")}>{comment.author.name}</span>
          <span className={cn("commentMetaDot")}>·</span>
          <span className={cn("commentTime")}>{comment.createdAt}</span>
        </div>
      </div>
      <p className={cn("commentContent")}>{comment.content}</p>
    </div>
  );

  const topLevelComments = comments.filter((c) => !c.parentId);
  const replyMap = comments.reduce<Record<string, BoardComment[]>>((acc, c) => {
    if (!c.parentId) return acc;
    if (!acc[c.parentId]) acc[c.parentId] = [];
    acc[c.parentId].push(c);
    return acc;
  }, {});

  return (
    <div className={cn("boardDetailPage")}>
      <article className={cn("postSection")}>
        <h1 className={cn("postTitle")}>{post.title}</h1>
        <div className={cn("postMetaRow")}>
          <div className={cn("authorInfo")}>
            <div className={cn("authorAvatar")}>
              <Image
                src={post.author.avatar ?? DEFAULT_AVATAR}
                alt="작성자 아바타"
                width={40}
                height={40}
              />
            </div>
            <div className={cn("authorMeta")}>
              <span className={cn("authorName")}>{post.author.name}</span>
              <span className={cn("authorMetaDot")}>·</span>
              <span className={cn("postTime")}>46분 전</span>
            </div>
          </div>
          <div className={cn("postActions")}>
            <button type="button" className={cn("iconButton")} aria-label="공유" onClick={handleShare}>
              <Image src={shareIcon} alt="공유" width={24} height={24} />
            </button>
            <div className={cn("moreMenuWrapper")} ref={moreMenuRef}>
              <button
                type="button"
                className={cn("iconButton")}
                aria-label="더보기"
                aria-expanded={showMoreMenu}
                onClick={() => setShowMoreMenu((prev) => !prev)}
              >
                <HiOutlineEllipsisVertical size={22} />
              </button>
              {showMoreMenu && (
                <div className={cn("moreMenu")}>
                  {isAuthor ? (
                    <>
                      <button type="button" className={cn("moreMenuItem")} onClick={handleEdit}>
                        수정
                      </button>
                      <button type="button" className={cn("moreMenuItem", "danger")} onClick={handleDelete}>
                        삭제
                      </button>
                    </>
                  ) : (
                    <button type="button" className={cn("moreMenuItem", "danger")} onClick={handleReport}>
                      신고
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className={cn("postContent")}>{post.contentFull}</p>
        {post.imageUrl && (
          <div className={cn("postImageWrap")}>
            <Image
              src={post.imageUrl}
              alt=""
              fill
              className={cn("postImage")}
              sizes="56.2rem"
            />
          </div>
        )}
        <div className={cn("engagementRow")}>
          <div className={cn("engagementLeft")}>
            <button
              type="button"
              className={cn("engagementItem", "engagementButton")}
              onClick={() => setIsLiked((prev) => !prev)}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <span className={cn("engagementIconWrap", { active: isLiked })}>
                <Image src={isLiked ? likeActiveIcon : heartIcon} alt="" width={24} height={24} className={cn("engagementIcon")} />
              </span>
              <span>{post.likeCount}</span>
            </button>
            <div className={cn("engagementItem")}>
              <Image src={commentIcon} alt="댓글" width={24} height={24} />
              <span>{post.commentCount}</span>
            </div>
            <button
              type="button"
              className={cn("iconButton", { active: isBookmarked })}
              aria-label={isBookmarked ? "북마크 취소" : "북마크"}
              onClick={() => setIsBookmarked((prev) => !prev)}
            >
              <Image src={isBookmarked ? bookmarkActiveIcon : bookmarkIcon} alt="북마크" width={24} height={24} className={cn("bookmarkIcon", { active: isBookmarked })} />
            </button>
          </div>
          <span className={cn("viewCount")}>조회 {post.viewCount}</span>
        </div>
      </article>

      <section className={cn("commentsSection")}>
        <h2 className={cn("commentsTitle")}>댓글</h2>
        <div className={cn("commentList")}>
          {topLevelComments.map((comment) => (
            <div key={comment.id} className={cn("commentThread")}>
              {renderComment(comment)}
              {(replyMap[comment.id] || []).map((reply) =>
                renderComment(reply, true)
              )}
            </div>
          ))}
        </div>
      </section>

      {showToast && (
        <div className={cn("toast")}>
          <p>링크가 복사되었습니다.</p>
        </div>
      )}
    </div>
  );
}
