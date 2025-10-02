// 쿠키 관련 유틸리티 함수들
import Cookies from 'js-cookie';

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = Cookies.get(name);
  console.log('쿠키 읽기 시도:', name, '값:', value);
  return value || null; 
};

// httpOnly 쿠키는 JavaScript로 읽을 수 없으므로, Zustand persist로 저장된 인증 상태 확인
export const hasCookie = (name: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Zustand persist로 저장된 user-store에서 isVerified 확인
  const userStoreData = localStorage.getItem('user-store');
  let isVerified = false;
  
  if (userStoreData) {
    try {
      const parsed = JSON.parse(userStoreData);
      isVerified = parsed.state?.isVerified || false;
    } catch (error) {
      console.error('user-store 파싱 오류:', error);
    }
  }
  
  console.log('인증 상태 확인:', name, '인증됨:', isVerified);
  console.log('user-store 데이터:', userStoreData);
  console.log('현재 모든 쿠키:', document.cookie);
  
  return isVerified;
};

// 동기 버전 (기존 호환성을 위해)
export const hasCookieSync = (name: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // localStorage에서 인증 상태 확인 (로그인 시 설정됨)
  const authStatus = localStorage.getItem('isAuthenticated');
  const isAuthenticated = authStatus === 'true';
  
  console.log('동기 인증 상태 확인:', name, '인증됨:', isAuthenticated);
  console.log('localStorage isAuthenticated:', authStatus);
  
  return isAuthenticated;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  const options = {
    expires: days,
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction, // 개발 환경에서는 false
  };
  
  Cookies.set(name, value, options);
  
  // 디버깅을 위한 로그
  console.log('쿠키 설정:', name, '=', value, '옵션:', options);
  console.log('설정된 쿠키 확인:', Cookies.get(name));
};

export const removeCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  Cookies.remove(name, { path: '/' });
  console.log('쿠키 삭제:', name);
};
