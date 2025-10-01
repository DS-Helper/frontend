import { hasCookie } from "./cookies";

// 사용자가 로그인되어 있는지 확인 (httpOnly 쿠키 존재 여부로 판단)
export const isAuthenticated = (): boolean => {
  return hasCookie('token');
};

// httpOnly 쿠키는 JavaScript로 읽을 수 없으므로 null 반환
export const getToken = (): string | null => {
  return null;
};
