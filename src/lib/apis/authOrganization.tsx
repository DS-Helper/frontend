import { instance } from "./axios";

export const postLogin = async (data: any) => {
  try {
    const res = await instance.post("/auth/login/organization", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};