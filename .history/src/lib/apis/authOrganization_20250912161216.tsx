import { instance } from "./axios";

export const postLogin = async (data: any) => {
  try {
    const res = await instance.post("/auth/", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};