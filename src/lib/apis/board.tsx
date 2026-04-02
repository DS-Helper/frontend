import { instance } from "./axios";
import { GetBoardsParams, PostBoardRequest, PatchBoardRequest } from "@/types/board";

export const getBoards = async (params: GetBoardsParams) => {
  try {
    const res = await instance.get(`/boards`, { params });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getBoardById = async (boardId: string) => {
  try {
    const res = await instance.get(`/board/${boardId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postBoard = async (data: PostBoardRequest) => {
  try {
    const res = await instance.post(`/boards`, data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const patchBoard = async (data: PatchBoardRequest) => {
  try {
    const res = await instance.patch(`/boards`, data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteBoard = async (boardId: string) => {
  try {
    const res = await instance.delete(`/board/${boardId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};