// 쿠키 관련 유틸리티 함수들
import Cookies from 'js-cookie';

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = Cookies.get(name);
  console.log('쿠키 읽기 시도:', name, '값:', value);
  return value || null; 
};

// 쿠키 존재 여부 확인 (실제 쿠키와 localStorage 모두 확인)
export const hasCookie = (name: string): boolean => {
  console.log('=== hasCookie 함수 호출됨 ===');
  console.log('함수 파라미터 name:', name);
  
  if (typeof window === 'undefined') {
    console.log('window가 undefined - SSR 환경');
    return false;
  }
  
  console.log('브라우저 환경에서 실행됨');
  
  try {
    // 1. 먼저 실제 쿠키 확인
    const actualCookie = Cookies.get(name);
    console.log('실제 쿠키 값:', actualCookie);
    console.log('쿠키 값 타입:', typeof actualCookie);
    console.log('쿠키 값 길이:', actualCookie ? actualCookie.length : 0);
    
    // 2. localStorage에서 인증 상태 확인
    const userStoreData = localStorage.getItem('user-store');
    let isVerified = false;
    let hasValidUser = false;
    
    console.log('localStorage에서 user-store 데이터:', userStoreData);
    console.log('user-store 데이터 타입:', typeof userStoreData);
    console.log('user-store 데이터 길이:', userStoreData ? userStoreData.length : 0);
    
    if (userStoreData) {
      try {
        const parsed = JSON.parse(userStoreData);
        console.log('파싱된 user-store 데이터:', parsed);
        console.log('parsed.state:', parsed.state);
        console.log('parsed.state.isVerified:', parsed.state?.isVerified);
        console.log('parsed.state.user:', parsed.state?.user);
        
        // isVerified와 user 데이터 모두 확인
        isVerified = parsed.state?.isVerified || false;
        hasValidUser = !!(parsed.state?.user && parsed.state.user.id);
        
        console.log('추출된 isVerified 값:', isVerified);
        console.log('유효한 사용자 데이터 존재:', hasValidUser);
        console.log('사용자 ID:', parsed.state?.user?.id);
      } catch (error) {
        console.error('user-store 파싱 오류:', error);
        console.error('파싱 실패한 데이터:', userStoreData);
        return false;
      }
    } else {
      console.log('user-store 데이터가 없음');
    }
    
    // 3. 인증 상태 판단 로직
    // 실제 쿠키가 있거나, localStorage에 유효한 인증 상태가 있으면 true
    const hasActualCookie = !!actualCookie;
    const hasValidLocalStorage = isVerified && hasValidUser;
    
    console.log('실제 쿠키 존재:', hasActualCookie);
    console.log('유효한 localStorage 상태:', hasValidLocalStorage);
    console.log('쿠키가 비어있지 않은가?', actualCookie && actualCookie.trim() !== '');
    
    const isAuthenticated = hasActualCookie || hasValidLocalStorage;
    console.log('최종 인증 상태:', isAuthenticated);
    console.log('인증 상태 결정 이유:', hasActualCookie ? '쿠키 존재' : (hasValidLocalStorage ? 'localStorage 유효' : '둘 다 없음'));
    
    return isAuthenticated;
  } catch (error) {
    console.error('쿠키/localStorage 접근 오류:', error);
    console.log('접근 실패 - 인증 상태: false 반환');
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
