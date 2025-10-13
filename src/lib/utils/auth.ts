// 사용자가 로그인되어 있는지 확인 (API 기반)
export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const { getCheckAuth } = await import('../apis/authUser');
    const response = await getCheckAuth();
    // true = 로그아웃, false = 로그인이므로 반대로 처리
    return !!(response && response.data === false);
  } catch {
    return false;
  }
};

// 토큰은 HttpOnly 쿠키로 관리되므로 null 반환
export const getToken = (): string | null => {
  return null;
};

// 인증 상태를 강제로 초기화하는 함수
export const clearAuthState = (): void => {
  if (typeof window !== 'undefined') {
    // localStorage에서 user-store 제거
    localStorage.removeItem('user-store');
  }
};

