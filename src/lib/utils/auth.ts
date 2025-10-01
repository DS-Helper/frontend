import { hasCookieSync } from "./cookies";

// 사용자가 로그인되어 있는지 확인 (localStorage 기반)
export const isAuthenticated = (): boolean => {
  return hasCookieSync('token');
};

// httpOnly 쿠키는 JavaScript로 읽을 수 없으므로 null 반환
export const getToken = (): string | null => {
  return null;
};
