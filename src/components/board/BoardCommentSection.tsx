import { FormEvent, useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Comment.module.scss";
import { getComments, getRecomments, postComment } from "@/lib/apis/comment";
import { BoardComment } from "@/types/board";
import type { GetCommentsResponse } from "@/types/comment";

const cn = classNames.bind(styles);
const DEFAULT_AVATAR = "/userIcon.svg";

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

function toRecordArray(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) {
    return body.filter(
      (v): v is Record<string, unknown> => v != null && typeof v === "object" && !Array.isArray(v)
    );
  }
  if (body == null || typeof body !== "object" || Array.isArray(body)) return [];
  const root = body as GetCommentsResponse & Record<string, unknown>;
  const dataObj =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as unknown as Record<string, unknown>)
      : null;
  const candidates = [dataObj?.content, root.content, root.data, root.comments, root.children, root.items];
  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    return c.filter(
      (v): v is Record<string, unknown> => v != null && typeof v === "object" && !Array.isArray(v)
    );
  }
  return [];
}

function toBoardComment(
  raw: Record<string, unknown>,
  fallbackBoardId: string,
  forcedParentId?: string
): BoardComment {
  const writerObj =
    raw.writer != null && typeof raw.writer === "object" && !Array.isArray(raw.writer)
      ? (raw.writer as Record<string, unknown>)
      : {};
  const authorObj =
    raw.author != null && typeof raw.author === "object" && !Array.isArray(raw.author)
      ? (raw.author as Record<string, unknown>)
      : {};
  const writerName =
    raw.writerName ??
    raw.userName ??
    raw.nickname ??
    writerObj.name ??
    authorObj.name ??
    "익명";
  const avatarCandidates = [
    raw.userProfileImageUrl,
    raw.user_profile_image_url,
    raw.writerProfileImageUrl,
    raw.writerProfileUrl,
    raw.writer_profile_image_url,
    raw.writer_profile_url,
    raw.profileImage,
    raw.profileImageUrl,
    raw.profile_image_url,
    raw.avatar,
    writerObj.profileImageUrl,
    writerObj.profile_image_url,
    writerObj.profileImage,
    writerObj.avatar,
    writerObj.imageUrl,
    writerObj.image_url,
    authorObj.profileImageUrl,
    authorObj.profile_image_url,
    authorObj.profileImage,
    authorObj.avatar,
    authorObj.imageUrl,
    authorObj.image_url,
  ];
  const writerAvatar =
    avatarCandidates
      .map((v) => (v == null ? "" : String(v).trim()))
      .find((v) => v.length > 0) ?? null;
  const parentIdRaw = forcedParentId ?? raw.parentId ?? raw.parent_id ?? null;
  return {
    id: String(raw.id ?? raw.commentId ?? raw.comment_id ?? ""),
    postId: String(raw.boardId ?? raw.postId ?? raw.post_id ?? fallbackBoardId),
    parentId:
      parentIdRaw == null || String(parentIdRaw).trim() === ""
        ? undefined
        : String(parentIdRaw),
    content: String(raw.content ?? raw.comment ?? ""),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    author: {
      id: String(authorObj.id ?? raw.userId ?? raw.writerId ?? raw.writer_id ?? ""),
      name: String(writerName),
      avatar:
        writerAvatar != null && String(writerAvatar).trim() !== ""
          ? String(writerAvatar)
          : undefined,
    },
  };
}

interface BoardCommentSectionProps {
  boardId: string;
}

export default function BoardCommentSection({ boardId }: BoardCommentSectionProps) {
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const topRes = await getComments(boardId);
      const topRecords = toRecordArray(topRes?.data ?? null);
      const topMapped = topRecords.map((r) => toBoardComment(r, boardId));
      const childEntries = await Promise.all(
        topMapped.map(async (parent) => {
          const childRes = await getRecomments(parent.id);
          const childRecords = toRecordArray(childRes?.data ?? null);
          const childMapped = childRecords.map((r) => toBoardComment(r, boardId, parent.id));
          return [parent.id, childMapped] as const;
        })
      );
      const childMap = new Map(childEntries);
      const merged: BoardComment[] = [];
      for (const parent of topMapped) {
        merged.push(parent);
        const children = childMap.get(parent.id) ?? [];
        merged.push(...children);
      }
      setComments(merged);
    } catch (e) {
      console.error(e);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [boardId]);

  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );
  const replyMap = useMemo(
    () =>
      comments.reduce<Record<string, BoardComment[]>>((acc, c) => {
        if (!c.parentId) return acc;
        if (!acc[c.parentId]) acc[c.parentId] = [];
        acc[c.parentId].push(c);
        return acc;
      }, {}),
    [comments]
  );

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    const next = commentDraft.trim();
    if (!next) return;
    setCommentPosting(true);
    try {
      await postComment({
        boardId,
        parentId: null,
        content: next,
      });
      setCommentDraft("");
      await loadComments();
    } catch (error) {
      console.error(error);
      alert("댓글 등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setCommentPosting(false);
    }
  };

  const handleSubmitReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyTargetId) return;
    const next = replyDraft.trim();
    if (!next) return;
    setReplyPosting(true);
    try {
      await postComment({
        boardId,
        parentId: replyTargetId,
        content: next,
      });
      setReplyDraft("");
      setReplyTargetId(null);
      await loadComments();
    } catch (error) {
      console.error(error);
      alert("대댓글 등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setReplyPosting(false);
    }
  };

  const renderComment = (comment: BoardComment, isReply?: boolean) => (
    <div key={comment.id} className={cn("commentItem", { isReply })}>
      <div className={cn("commentBody")}>
        <div className={cn("commentAvatar")}>
          <Image
            src={comment.author.avatar ?? DEFAULT_AVATAR}
            alt={`${comment.author.name} 프로필`}
            width={30}
            height={30}
          />
        </div>
        <div className={cn("commentMeta")}>
          <span className={cn("commentAuthor")}>{comment.author.name}</span>
          <span className={cn("commentMetaDot")}>·</span>
          <span className={cn("commentTime")}>{formatRelativeTime(comment.createdAt)}</span>
        </div>
      </div>
      <p className={cn("commentContent")}>{comment.content}</p>
      {replyTargetId === comment.id && (
        <form className={cn("replyComposer")} onSubmit={(e) => void handleSubmitReply(e)}>
          <label htmlFor={`reply-input-${comment.id}`} className={cn("commentComposerSrOnly")}>
            대댓글 입력
          </label>
          <input
            id={`reply-input-${comment.id}`}
            type="text"
            className={cn("replyComposerInput")}
            placeholder="대댓글을 작성해보세요."
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            maxLength={1000}
            disabled={replyPosting}
          />
          <div className={cn("replyComposerActions")}>
            <button
              type="button"
              className={cn("replyComposerCancel")}
              onClick={() => {
                setReplyTargetId(null);
                setReplyDraft("");
              }}
              disabled={replyPosting}
            >
              취소
            </button>
            <button
              type="submit"
              className={cn("replyComposerSubmit")}
              disabled={replyPosting}
            >
              등록
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <section className={cn("commentsSection")}>
      <h2 className={cn("commentsTitle")}>댓글</h2>
      <form className={cn("commentComposer")} onSubmit={(e) => void handleSubmitComment(e)}>
        <label htmlFor="board-comment-input" className={cn("commentComposerSrOnly")}>
          댓글 입력
        </label>
        <input
          id="board-comment-input"
          type="text"
          className={cn("commentComposerInput")}
          placeholder="댓글을 작성해보세요."
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          maxLength={1000}
          disabled={commentPosting}
        />
      </form>
      <div className={cn("commentList")}>
        {commentsLoading ? (
          <p className={cn("commentEmptyText")}>댓글을 불러오는 중...</p>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <div key={comment.id} className={cn("commentThread")}>
              {renderComment(comment)}
              {(replyMap[comment.id] || []).map((reply) => renderComment(reply, true))}
            </div>
          ))
        ) : (
          <p className={cn("commentEmptyText")}>첫 댓글을 남겨보세요.</p>
        )}
      </div>
    </section>
  );
}
