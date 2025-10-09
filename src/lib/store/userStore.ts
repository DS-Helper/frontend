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
        
        // localStorage에서 인증 상태 확인
        const hasToken = hasCookie('token');
        console.log('checkAuthStatus 호출 - 인증 상태:', hasToken);
        
        if (hasToken) {
          set({ isVerified: true });
          console.log('인증 상태: true로 설정');
        } else {
          set({ isVerified: false, user: null, accessToken: null });
          console.log('인증 상태: false로 설정');
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
