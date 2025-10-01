// 쿠키 관련 유틸리티 함수들
import Cookies from 'js-cookie';

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = Cookies.get(name);
  console.log('쿠키 읽기 시도:', name, '값:', value);
  return value || null; 
};

// httpOnly 쿠키는 JavaScript로 읽을 수 없으므로, 쿠키 존재 여부만 확인
export const hasCookie = (name: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // document.cookie에서 쿠키 이름이 포함되어 있는지 확인
  const cookieExists = document.cookie.includes(`${name}=`);
  console.log('쿠키 존재 여부 확인:', name, '존재:', cookieExists);
  console.log('현재 모든 쿠키:', document.cookie);
  return cookieExists;
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
