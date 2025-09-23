import { instance } from "./axios";
import { setCookie, removeCookie } from "../utils/cookies";

export const postLogin = async (data: any) => {
  try {
    const res = await instance.post("/auth/login/organization", data);
    
    // 응답에서 토큰을 받아 쿠키에 저장
    if (res.data && res.data.token) {
      setCookie('token', res.data.token, 7); // 7일간 유효
    }
    
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postLogout = async () => {
  try {
    const res = await instance.post("/auth/logout");
    
    // 쿠키에서 토큰 제거
    removeCookie('token');
    
    return res;
  } catch (e) {
    console.error(e);
    // 에러가 발생해도 쿠키는 제거
    removeCookie('token');
    return null;
  }
};