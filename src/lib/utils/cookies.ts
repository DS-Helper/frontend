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
  console.log('=== hasCookie 함수 호출됨 ===');
  console.log('함수 파라미터 name:', name);
  
  if (typeof window === 'undefined') {
    console.log('window가 undefined - SSR 환경');
    return false;
  }
  
  console.log('브라우저 환경에서 실행됨');
  
  try {
    // localStorage 접근 시 예외 처리 추가
    const userStoreData = localStorage.getItem('user-store');
    let isVerified = false;
    
    console.log('localStorage에서 user-store 데이터:', userStoreData);
    
    if (userStoreData) {
      try {
        const parsed = JSON.parse(userStoreData);
        console.log('파싱된 user-store 데이터:', parsed);
        isVerified = parsed.state?.isVerified || false;
        console.log('추출된 isVerified 값:', isVerified);
      } catch (error) {
        console.error('user-store 파싱 오류:', error);
      }
    } else {
      console.log('user-store 데이터가 없음');
    }
    
    console.log('최종 인증 상태:', isVerified);
    console.log('현재 모든 쿠키:', document.cookie);
    console.log('=== hasCookie 함수 종료 ===');
    
    return isVerified;
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    console.log('localStorage 접근 실패 - 인증 상태: false 반환');
    return false;
  }
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  const options = {
    expires: days,
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction || isHttps, // HTTPS 환경에서는 항상 secure
  };
  
  try {
    Cookies.set(name, value, options);
    
    // 디버깅을 위한 로그
    console.log('쿠키 설정:', name, '=', value, '옵션:', options);
    console.log('현재 프로토콜:', window.location.protocol);
    console.log('설정된 쿠키 확인:', Cookies.get(name));
  } catch (error) {
    console.error('쿠키 설정 오류:', error);
  }
};

export const removeCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const isHttps = window.location.protocol === 'https:';
    Cookies.remove(name, { 
      path: '/',
      secure: isHttps // HTTPS 환경에서는 secure 옵션 추가
    });
    console.log('쿠키 삭제:', name);
  } catch (error) {
    console.error('쿠키 삭제 오류:', error);
  }
};
