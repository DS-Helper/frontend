import axios, { AxiosInstance } from "axios";
import { hasCookie, removeCookie } from "../utils/cookies";
import { useUserStore } from "../store/userStore";

export const instance: AxiosInstance = axios.create({
  baseURL: "https://www.dshelper.kro.kr",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    // httpOnly 쿠키 존재 여부 확인
    const hasToken = hasCookie('token');
    console.log('=== API 요청 인터셉터 ===');
    console.log('API 요청 URL:', config.url);
    console.log('쿠키 존재 여부:', hasToken);
    
    // httpOnly 쿠키는 withCredentials: true로 자동 전송되므로 별도 헤더 설정 불필요
    if (hasToken) {
      console.log('✅ httpOnly 쿠키가 존재하여 자동으로 전송됨');
    } else {
      console.log('❌ 쿠키가 없음');
    }
    console.log('========================');
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ API 응답 에러:', error.response?.status, error.config?.url);
    console.log('에러 응답 데이터:', error.response?.data);
    console.log('요청 헤더:', error.config?.headers);
    
    // 401 에러 (인증 실패) 시 자동 로그아웃
    if (error.response?.status === 401) {
      console.log('인증 실패 - 자동 로그아웃');
      
      // httpOnly 쿠키는 JavaScript로 삭제할 수 없으므로 백엔드에서 처리해야 함
      // 스토어에서 사용자 상태만 초기화
      const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
      setIsVerified(false);
      setUser(null);
      setAccessToken(null);
      
      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);