// 사용자가 로그인되어 있는지 확인 (쿠키 기반)
export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // 사용자 타입에 따라 적절한 API 호출
    const { useUserStore } = await import('../store/userStore');
    const { userType } = useUserStore.getState();
    
    const { getCheckAuth: getUserCheckAuth } = await import('../apis/authUser');
    const { getCheckAuth: getOrgCheckAuth } = await import('../apis/authOrganization');
    
    const checkAuthPromise = userType === 'organization' 
      ? getOrgCheckAuth() 
      : getUserCheckAuth();
      
    const response = await checkAuthPromise;
    // true = 로그인, false = 로그아웃
    return !!(response && response.data === true);
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

