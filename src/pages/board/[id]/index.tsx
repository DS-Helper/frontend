"use client";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/BoardDetail.module.scss";
import Image from "next/image";
import {
  getBoardPostDetail,
  getBoardComments,
  BoardPostDetail,
  BoardComment,
} from "@/types/board";
import { IoShareOutline } from "react-icons/io5";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import { FaRegBookmark } from "react-icons/fa";
import heartIcon from "@/public/boardLikeIcon.svg";
import commentIcon from "@/public/boardCommentIcon.svg";

const cn = classNames.bind(styles);

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [comments, setComments] = useState<BoardComment[]>([]);

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
      <div className={cn("commentAvatar")} />
      <div className={cn("commentBody")}>
        <div className={cn("commentMeta")}>
          <span className={cn("commentAuthor")}>{comment.author.name}</span>
          <span className={cn("commentTime")}>{comment.createdAt}</span>
        </div>
        <p className={cn("commentContent")}>{comment.content}</p>
      </div>
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
            <div className={cn("authorAvatar")} />
            <div>
              <span className={cn("authorName")}>{post.author.name}</span>
              <span className={cn("postTime")}>46분 전</span>
            </div>
          </div>
          <div className={cn("postActions")}>
            <button type="button" className={cn("iconButton")} aria-label="공유">
              <IoShareOutline size={22} />
            </button>
            <button type="button" className={cn("iconButton")} aria-label="더보기">
              <HiOutlineEllipsisVertical size={22} />
            </button>
          </div>
        </div>
        <p className={cn("postContent")}>{post.contentFull}</p>
        <div className={cn("engagementRow")}>
          <div className={cn("engagementLeft")}>
            <div className={cn("engagementItem")}>
              <Image src={heartIcon} alt="좋아요" width={24} height={24} />
              <span>{post.likeCount}</span>
            </div>
            <div className={cn("engagementItem")}>
              <Image src={commentIcon} alt="댓글" width={24} height={24} />
              <span>{post.commentCount}</span>
            </div>
            <button type="button" className={cn("iconButton")} aria-label="북마크">
              <FaRegBookmark size={22} />
            </button>
          </div>
          <span className={cn("viewCount")}>조회 {post.viewCount}</span>
        </div>
      </article>

      <section className={cn("commentsSection")}>
        <h2 className={cn("commentsTitle")}>댓글</h2>
        <div className={cn("commentList")}>
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              {(replyMap[comment.id] || []).map((reply) =>
                renderComment(reply, true)
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
