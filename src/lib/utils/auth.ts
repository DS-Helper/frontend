import { getCookie } from "./cookies";

// 사용자가 로그인되어 있는지 확인
export const isAuthenticated = (): boolean => {
  const token = getCookie('token');
  return !!token;
};

// 토큰 가져오기
export const getToken = (): string | null => {
  return getCookie('token');
};
