import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { hasCookie } from "../utils/cookies";
import { instance } from "../apis/axios";

interface UserState {
  user: User | null;
  isVerified: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsVerified: (isVerified: boolean) => void;
  checkAuthStatus: () => void;
}

export const useUserStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      accessToken: null,
      isVerified: false,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsVerified: (isVerified) => set({ isVerified }),
      checkAuthStatus: () => {
        console.log('=== checkAuthStatus 함수 호출됨 ===');
        
        // 현재 상태에서 isVerified 확인 (하이드레이션된 상태)
        const currentState = get();
        console.log('현재 스토어 상태:', currentState);
        
        // localStorage에서 기존 인증 상태 확인
        const hasToken = hasCookie('token');
        console.log('localStorage 기반 인증 상태:', hasToken);
        
        if (hasToken) {
          // localStorage에 인증 상태가 있으면 실제 API 호출로 확인
          console.log('localStorage에 인증 상태 있음 - API 호출로 확인');
          
          // 간단한 API 호출로 쿠키 존재 여부 확인
          instance.get('/oauth/kakao/login-url') // 기존에 있는 간단한 엔드포인트
            .then((response) => {
              console.log('✅ 쿠키 확인 성공 - 인증 상태: true');
              // API 호출 성공 시에만 인증 상태를 true로 설정
              set({ isVerified: true });
            })
            .catch((error) => {
              console.log('❌ 쿠키 확인 실패 - 인증 상태: false');
              console.log('API 오류:', error);
              // API 호출 실패 시 모든 인증 관련 데이터 초기화
              set({ isVerified: false, user: null, accessToken: null });
              // localStorage도 정리
              localStorage.removeItem('user-store');
            });
        } else {
          console.log('localStorage에 인증 상태 없음 - 인증 상태: false');
          // 인증 상태가 없으면 모든 데이터 초기화
          set({ isVerified: false, user: null, accessToken: null });
        }
        
        console.log('=== checkAuthStatus 함수 종료 ===');
      },
    }),
    { 
      name: "user-store",
      // 하이드레이션 완료 후 콜백 추가
      onRehydrateStorage: () => (state) => {
        console.log('=== Zustand 하이드레이션 완료 ===');
        if (state) {
          console.log('하이드레이션된 상태:', state);
          // 하이드레이션 완료 후 인증 상태 재확인
          setTimeout(() => {
            state.checkAuthStatus();
          }, 100);
        }
      }
    }
  )
);
