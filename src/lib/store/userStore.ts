import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { hasCookieSync } from "../utils/cookies";

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
    (set) => ({
      user: null,
      accessToken: null,
      isVerified: false,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsVerified: (isVerified) => set({ isVerified }),
      checkAuthStatus: async () => {
        // 먼저 localStorage에서 확인
        const hasToken = hasCookieSync('token');
        console.log('checkAuthStatus 호출 - localStorage 인증 상태:', hasToken);
        
        if (hasToken) {
          set({ isVerified: true });
          console.log('인증 상태: true로 설정 (localStorage)');
        } else {
          // localStorage에 없으면 백엔드 API로 확인
          try {
            const response = await fetch('https://www.dshelper.kro.kr/api/auth/check', {
              method: 'GET',
              credentials: 'include',
            });
            
            if (response.ok) {
              // 백엔드에서 인증됨으로 응답하면 localStorage에 저장
              localStorage.setItem('isAuthenticated', 'true');
              set({ isVerified: true });
              console.log('인증 상태: true로 설정 (백엔드 확인)');
            } else {
              set({ isVerified: false, user: null, accessToken: null });
              console.log('인증 상태: false로 설정 (백엔드 확인)');
            }
          } catch (error) {
            console.error('인증 상태 확인 실패:', error);
            set({ isVerified: false, user: null, accessToken: null });
            console.log('인증 상태: false로 설정 (에러)');
          }
        }
      },
    }),
    { name: "user-store" }
  )
);
