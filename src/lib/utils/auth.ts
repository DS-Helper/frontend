import { hasCookie } from "./cookies";

// 사용자가 로그인되어 있는지 확인 (localStorage 기반)
export const isAuthenticated = (): boolean => {
  // hasCookie 함수에서 이미 isVerified와 user 데이터를 모두 확인하므로
  // 단순히 hasCookie 결과를 반환
  return hasCookie('token');
};

// httpOnly 쿠키는 JavaScript로 읽을 수 없으므로 null 반환
export const getToken = (): string | null => {
  return null;
};

// 인증 상태를 강제로 초기화하는 함수
export const clearAuthState = (): void => {
  if (typeof window !== 'undefined') {
    // localStorage에서 user-store 제거
    localStorage.removeItem('user-store');
    console.log('인증 상태가 초기화되었습니다.');
  }
};

// 쿠키 설정 테스트 함수 (디버깅용)
export const testCookieSetting = (): void => {
  console.log('=== 쿠키 설정 테스트 시작 ===');
  const { setCookie } = require('./cookies');
  const testValue = 'test-token-' + Date.now();
  setCookie('token', testValue, 1);
  
  // 잠시 후 확인
  setTimeout(() => {
    console.log('=== 쿠키 설정 테스트 결과 ===');
    const Cookies = require('js-cookie');
    const retrievedValue = Cookies.get('token');
    console.log('설정한 값:', testValue);
    console.log('읽어온 값:', retrievedValue);
    console.log('테스트 성공:', retrievedValue === testValue);
  }, 100);
};
