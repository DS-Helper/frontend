import axios, { AxiosInstance } from "axios";
import { getCookie, removeCookie } from "../utils/cookies";
import { useUserStore } from "../store/userStore";

export const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    // 쿠키에서 토큰 읽어오기
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 (인증 실패) 시 자동 로그아웃
    if (error.response?.status === 401) {
      console.log('인증 실패 - 자동 로그아웃');
      
      // 쿠키에서 토큰 제거
      removeCookie('token');
      
      // 스토어에서 사용자 상태 초기화
      const { setIsVerified, setUser, setAccessToken } = useUserStore.getState();
      setIsVerified(false);
      setUser(null);
      setAccessToken(null);
    }
    
    return Promise.reject(error);
  }
);