import { instance } from "../apis/axios";
import { useUserStore } from "../store/userStore";

export const handleLogout = async () => {
  try {
    // 백엔드 서버에 로그아웃 요청
    const response = await instance.post("/logout");
    
    // 스토어에서 사용자 상태 초기화 (Zustand persist로 자동 저장됨)
    const { setIsVerified, setUser, setUserType } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setUserType(null);
    
    return response;
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
    
    // 에러가 발생해도 로컬 상태는 초기화
    const { setIsVerified, setUser, setUserType } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setUserType(null);
    
    throw error;
  }
};

