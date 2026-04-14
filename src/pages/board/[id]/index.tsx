"use client";

import { useRouter } from "next/router";
import { useState, useEffect, useRef, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/BoardDetail.module.scss";
import Image from "next/image";
import { BoardPostDetail } from "@/types/board";
import { resolveProfileImageSrc } from "@/lib/utils/image";
import { deleteBoard, getBoardById, likeBoard, likeCount, scrapBoard } from "@/lib/apis/board";
import {
  mapItemToBoardPostDetail,
  parseBoardRecordFromApi,
  parseLikeCountResponse,
  parseScrapToggleResponse,
  parseLikeToggleResponse,
} from "@/lib/board/mapBoardPost";
import { useUserStore } from "@/lib/store/userStore";
import BoardCommentSection from "@/components/board/BoardCommentSection";
import shareIcon from "@/public/boardShareIcon.svg";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";

import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";
import bookmarkIcon from "@/public/boardBookmarkIcon.svg";
import bookmarkActiveIcon from "@/public/boardBookmarkFilledIcon.svg";
import likeActiveIcon from "@/public/boardLikeFilledIcon.svg";

const DEFAULT_AVATAR = "/userIcon.svg";

const cn = classNames.bind(styles);

function formatRelativeTime(dateLike: string): string {
  const raw = dateLike?.trim();
  if (!raw) return "—";
  const time = new Date(raw).getTime();
  if (!Number.isFinite(time)) return raw;

  const diffMs = Date.now() - time;
  if (diffMs < 0) return "방금 전";

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return "방금 전";
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}분 전`;
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}시간 전`;
  if (diffMs < 7 * dayMs) return `${Math.floor(diffMs / dayMs)}일 전`;

  const d = new Date(time);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { userId } = useUserStore();
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [postWriterId, setPostWriterId] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [deleteInFlight, setDeleteInFlight] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const likeInFlightRef = useRef(false);
  const scrapInFlightRef = useRef(false);
  const authorAvatarSrc = useMemo(
    () => resolveProfileImageSrc(post?.author.avatar, DEFAULT_AVATAR),
    [post?.author.avatar]
  );

  // writerId(=author.id)와 저장된 userId를 기준으로 작성자 여부 판단
  const normalizedMyId = String(userId ?? "").trim();
  const normalizedPostWriterId = String(postWriterId || post?.author.id || "").trim();
  const isAuthor =
    normalizedMyId !== "" &&
    normalizedPostWriterId !== "" &&
    normalizedMyId === normalizedPostWriterId;

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
    if (!router.isReady || !id || typeof id !== "string") return;
    let cancelled = false;
    (async () => {
      const res = await getBoardById(id);
      if (cancelled) return;
      const record = res?.data != null ? parseBoardRecordFromApi(res.data) : null;
      if (!record) {
        router.push("/board");
        return;
      }
      const detail = mapItemToBoardPostDetail(record);
      if (!detail.id) {
        router.push("/board");
        return;
      }
      setPost(detail);
      const rawWriterId = record.writerId ?? record.writer_id ?? record.userId ?? null;
      setPostWriterId(rawWriterId == null ? "" : String(rawWriterId).trim());
      const scrapRaw = record.isScrapped ?? record.scrapped ?? record.isScrap;
      if (typeof scrapRaw === "boolean") {
        setIsBookmarked(scrapRaw);
      } else if (scrapRaw === "true") {
        setIsBookmarked(true);
      } else if (scrapRaw === "false") {
        setIsBookmarked(false);
      } else {
        setIsBookmarked(false);
      }
      const likedRaw = record.liked ?? record.isLiked;
      if (typeof likedRaw === "boolean") {
        setIsLiked(likedRaw);
      } else if (likedRaw === "true") {
        setIsLiked(true);
      } else if (likedRaw === "false") {
        setIsLiked(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router.isReady, router]);

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
    if (!post) return;
    void router.push({
      pathname: "/board/write",
      query: {
        mode: "edit",
        boardId: post.id,
        category: post.category,
        title: post.title,
        content: post.contentFull,
        imageUrl: post.imageUrl ?? "",
      },
    });
  };

  const handleDelete = async () => {
    setShowMoreMenu(false);
    if (typeof id !== "string" || deleteInFlight) return;
    const shouldDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!shouldDelete) return;
    setDeleteInFlight(true);
    try {
      const res = await deleteBoard(id);
      if (res == null) {
        alert("삭제에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      alert("게시글이 삭제되었습니다.");
      await router.push("/board");
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteInFlight(false);
    }
  };

  const handleReport = () => {
    setShowMoreMenu(false);
    // TODO: 신고 모달 또는 API
    alert("신고 기능은 준비 중입니다.");
  };

  const handleLikeClick = async () => {
    if (typeof id !== "string" || !post || likeInFlightRef.current) return;
    likeInFlightRef.current = true;
    const prevLiked = isLiked;
    setIsLiked((prev) => !prev);
    try {
      const toggleRes = await likeBoard(id);
      if (toggleRes == null) {
        setIsLiked(prevLiked);
        return;
      }
      const { liked } = parseLikeToggleResponse(toggleRes.data);
      if (typeof liked === "boolean") setIsLiked(liked);
      const countRes = await likeCount(id);
      const nextCount = parseLikeCountResponse(countRes?.data ?? null);
      if (nextCount != null) {
        setPost((p) => (p ? { ...p, likeCount: nextCount } : null));
      }
    } catch (e) {
      console.error(e);
      setIsLiked(prevLiked);
    } finally {
      likeInFlightRef.current = false;
    }
  };

  const handleScrapClick = async () => {
    if (typeof id !== "string" || scrapInFlightRef.current) return;
    scrapInFlightRef.current = true;
    try {
      const res = await scrapBoard(id);
      if (res == null) return;
      const { isScrapped } = parseScrapToggleResponse(res.data ?? null);
      if (typeof isScrapped === "boolean") {
        setIsBookmarked(isScrapped);
      } else {
        // 응답에 상태 필드가 없는 경우에도 토글 UX 유지
        setIsBookmarked((prev) => !prev);
      }
    } finally {
      scrapInFlightRef.current = false;
    }
  };

  if (!post) {
    return (
      <div className={cn("boardDetailPage")}>
        <div className={cn("loading")}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={cn("boardDetailPage")}>
      <article className={cn("postSection")}>
        <h1 className={cn("postTitle")}>{post.title}</h1>
        <div className={cn("postMetaRow")}>
          <div className={cn("authorInfo")}>
            <div className={cn("authorAvatar")}>
              <Image
                src={authorAvatarSrc}
                alt="작성자 아바타"
                width={38}
                height={38}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src.endsWith(DEFAULT_AVATAR)) return;
                  target.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div className={cn("authorMeta")}>
              <span className={cn("authorName")}>{post.author.name}</span>
              <span className={cn("authorMetaDot")}>·</span>
              <span className={cn("postTime")}>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
          <div className={cn("postActions")}>
            <button type="button" className={cn("iconButton")} aria-label="공유" onClick={handleShare}>
              <Image src={shareIcon} alt="공유" width={24} height={24} />
            </button>
            <div className={cn("moreMenuWrapper")} ref={moreMenuRef}>
              <button
                type="button"
                className={cn("iconButton", "settingButton")}
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
                      <button type="button" className={cn("moreMenuItem", "danger")} onClick={() => void handleDelete()}>
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
            <img src={post.imageUrl} alt="" className={cn("postImage")} />
          </div>
        )}
        <div className={cn("engagementRow")}>
          <div className={cn("engagementLeft")}>
            <button
              type="button"
              className={cn("engagementItem", "engagementButton")}
              onClick={() => void handleLikeClick()}
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
              onClick={() => void handleScrapClick()}
            >
              <Image src={isBookmarked ? bookmarkActiveIcon : bookmarkIcon} alt="북마크" width={24} height={24} className={cn("bookmarkIcon", { active: isBookmarked })} />
            </button>
          </div>
          <span className={cn("viewCount")}>조회 {post.viewCount}</span>
        </div>
      </article>

      {typeof id === "string" && <BoardCommentSection boardId={id} />}

      {showToast && (
        <div className={cn("toast")}>
          <p>링크가 복사되었습니다.</p>
        </div>
      )}
    </div>
  );
}
