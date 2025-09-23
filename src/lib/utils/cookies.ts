// 쿠키 관련 유틸리티 함수들
import Cookies from 'js-cookie';

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = Cookies.get(name);
  console.log('쿠키 읽기 시도:', name, '값:', value);
  return value || null; 
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
