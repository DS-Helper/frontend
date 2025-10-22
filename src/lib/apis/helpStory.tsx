import { instance } from "./axios";

export const getPosts = async () => {
  try {
    const res = await instance.get("/posts");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postPost = async (data: any) => {
  try {
    const res = await instance.post("/posts", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getPost = async (postId: string) => {
  try {
    const res = await instance.get(`/posts/${postId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const putPost = async (data: any) => {
  try {
    const res = await instance.put(`/posts`, data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};
