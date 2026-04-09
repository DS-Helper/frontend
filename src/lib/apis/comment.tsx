import { instance } from "./axios";
import type {
  DeleteCommentRequest,
  GetCommentsResponse,
  PatchCommentRequest,
  PostCommentRequest,
} from "@/types/comment";


export const getComments = async (boardId: string) => {
  try {
    const res = await instance.get<GetCommentsResponse>(`/comments/${boardId}/comments`);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRecomments = async (parentId: string) => {
  try {
    const res = await instance.get<GetCommentsResponse>(`/comments/${parentId}/children`);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postComment = async (data: PostCommentRequest) => {
  try {
    const res = await instance.post("/comment", data);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteComment = async ({ commentId }: DeleteCommentRequest) => {
  try {
    const res = await instance.delete("/comment", {
      data: {
        commentId,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const patchComment = async (data: PatchCommentRequest) => {
  try {
    const res = await instance.patch(`/comment`, data);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};