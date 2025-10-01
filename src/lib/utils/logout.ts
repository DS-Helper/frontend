import { instance } from "../apis/axios";
import { useUserStore } from "../store/userStore";
import { removeCookie } from "./cookies";

export const handleLogout = async () => {
  try {
    console.log('로그아웃 API 호출 시작');
    
    // 백엔드 서버에 로그아웃 요청
    const response = await instance.post("/logout");
    console.log('로그아웃 API 응답:', response);
    
    // 쿠키에서 토큰 제거
    removeCookie('token');
    
    // 스토어에서 사용자 상태 초기화
    const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setAccessToken(null);
    
    console.log('로그아웃 완료');
    return response;
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
    
    // 에러가 발생해도 로컬 상태는 초기화
    removeCookie('token');
    const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setAccessToken(null);
    
    throw error;
  }
};

