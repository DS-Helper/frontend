import { instance } from "./axios";

export const postLogin = async (data: any) => {
  try {
    const res = await instance.post("/auth/login/organization", data);
    return res;
  } catch (e) {
    console.error('기관 로그인 API 에러:', e);
    // 에러 객체를 그대로 던져서 상위에서 처리할 수 있도록 함
    throw e;
  }
};

export const getCheckAuth = async () => {
  try {
    const res = await instance.get("/auth/check-logged-in/organization");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};