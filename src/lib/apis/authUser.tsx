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

export const getLogin = async (code: string) => {
  try {
    const res = await instance.post("/oauth/kakao/login", {
      code: code,
    });
    alert(res.data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const naverLoginUrl = async () => {
  try {
    const res = await instance.get("/oauth/naver/login-url");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const naverLogin = async (data: any) => {
  try {
    const res = await instance.get("/oauth/naver/login", { params: data });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const googleLoginUrl = async () => {
  try {
    const res = await instance.get("/oauth/google/login-url");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const googleLogin = async (data: any) => {
  try {
    const res = await instance.get("/oauth/google/login", { params: data });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getCheckAuth = async () => {
  try {
    const res = await instance.get("/auth/check-logged-in");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};