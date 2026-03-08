import axios, { AxiosInstance } from "axios";
import { useUserStore } from "../store/userStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const testURL = process.env.NEXT_PUBLIC_TEST_API_URL;

// 스웨거 테스트용: production이 아닐 때는 테스트 URL 사용 (복원 시 아래를 production 기준으로 되돌리기)
export const instance: AxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (response) => {
    // API 호출 성공 시에는 인증 상태를 자동으로 변경하지 않음
    // 인증 상태는 로그인 시에만 설정되고, checkAuthStatus에서 관리됨
    return response;
  },
  (error) => {
    // 401 에러 (인증 실패) 시 자동 로그아웃
    if (error.response?.status === 401) {
      // 스토어에서 사용자 상태 초기화 (Zustand persist로 자동 저장됨)
      const { setIsVerified, setUser, setUserType } = useUserStore.getState();
      setIsVerified(false);
      setUser(null);
      setUserType(null);
      
      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // 403 에러 (권한 없음) 시 처리
    // 예약 관련 API는 modify.tsx에서 별도로 처리하므로 여기서는 alert를 표시하지 않음
    if (error.response?.status === 403) {
      console.error('403 에러: 권한이 없습니다.');
      console.error('에러 응답:', error.response?.data);
      
      // 예약 관련 API가 아닌 경우에만 alert 표시
      const url = error.config?.url || '';
      const isReservationApi = url.includes('/personal-reservations') || url.includes('/organization-reservations');
      
      if (typeof window !== 'undefined' && !isReservationApi) {
        alert('해당 기능에 대한 권한이 없습니다. 관리자에게 문의하세요.');
      }
    }
    
    return Promise.reject(error);
  }
);