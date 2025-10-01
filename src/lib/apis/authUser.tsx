import { instance } from "./axios";

export const getLoginUrl = async () => {
  try {
    const res = await instance.get("/oauth/kakao/login-url");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getLogin = async (data: any) => {
  try {
    const res = await instance.get("/oauth/kakao/login", { params: data });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};