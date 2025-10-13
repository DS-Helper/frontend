import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { hasCookie } from "../utils/cookies";

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
        console.log('hasCookie 기반 인증 상태:', hasToken);
        
        if (hasToken) {
          console.log('인증 상태 있음 - 상태 유지');
          // hasCookie에서 이미 쿠키와 localStorage를 모두 확인했으므로
          // 추가 API 호출 없이 상태를 유지
          if (!currentState.isVerified) {
            set({ isVerified: true });
          }
        } else {
          console.log('인증 상태 없음 - 모든 데이터 초기화');
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
          console.log('하이드레이션된 isVerified:', state.isVerified);
          console.log('하이드레이션된 user:', state.user);
          console.log('하이드레이션된 accessToken:', state.accessToken);
          
          // 하이드레이션 완료 후 인증 상태 재확인
          setTimeout(() => {
            console.log('=== 하이드레이션 후 인증 상태 재확인 시작 ===');
            state.checkAuthStatus();
          }, 100);
        }
      }
    }
  )
);
