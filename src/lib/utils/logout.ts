import { postLogout } from "../apis/authOrganization";
import { useUserStore } from "../store/userStore";

export const handleLogout = async () => {
  try {
    // 서버에 로그아웃 요청
    await postLogout();
    
    // 스토어에서 사용자 상태 초기화
    const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setAccessToken(null);
    
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
    // 에러가 발생해도 로컬 상태는 초기화
    const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
    setIsVerified(false);
    setUser(null);
    setAccessToken(null);
  }
};

