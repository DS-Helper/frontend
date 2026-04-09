import { instance } from "./axios";
import {
  GetBoardByIdApiResponse,
  GetBoardsApiResponse,
  GetBoardsParams,
  PatchBoardRequest,
  PostBoardRequest,
} from "@/types/board";
import { AxiosResponse } from "axios";

export const getBoards = async (
  params: GetBoardsParams
): Promise<AxiosResponse<GetBoardsApiResponse> | null> => {
  try {
    const res = await instance.get<GetBoardsApiResponse>(`/boards`, { params });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getBoardById = async (boardId: string) => {
  try {
    const res = await instance.get<GetBoardByIdApiResponse>(`/board/${boardId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postBoard = async ({ dto, images }: PostBoardRequest) => {
  try {
    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(dto)], { type: "application/json" })
    );
    for (const file of images ?? []) {
      formData.append("images", file);
    }
    const res = await instance.post(`/boards`, formData);
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

export const getSearchBoards = async (
  keyword: string,
  page?: number,
  size?: number
): Promise<AxiosResponse<GetBoardsApiResponse> | null> => {
  try {
    const res = await instance.get<GetBoardsApiResponse>("/boards/search", {
      params: {
        keyword,
        page,
        size,
      },
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const likeBoard = async (boardId: string) => {
  try {
    const res = await instance.post(`/board/${boardId}/like`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const likeCount = async (boardId: string) => {
  try {
    const res = await instance.get(`/${boardId}/like/count`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const scrapBoard = async (boardId: string) => {
  try {
    const res = await instance.post(`/board/${boardId}/scrap`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};