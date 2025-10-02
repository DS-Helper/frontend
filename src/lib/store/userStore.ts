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
    (set) => ({
      user: null,
      accessToken: null,
      isVerified: false,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsVerified: (isVerified) => set({ isVerified }),
      checkAuthStatus: () => {
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
      },
    }),
    { name: "user-store" }
  )
);
