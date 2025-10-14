import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { getCheckAuth } from "../apis/authUser";

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
        // getCheckAuth API를 호출하여 서버에서 인증 상태 확인
        getCheckAuth()
          .then((response) => {
            if (response && response.data === true) {
              // 서버에서 로그인 상태 확인됨 (true = 로그인)
              set({ isVerified: true });
            } else {
              // 서버에서 로그아웃 상태 확인됨 (false = 로그아웃)
              set({ isVerified: false, user: null, accessToken: null });
              localStorage.removeItem('user-store');
            }
          })
          .catch(() => {
            // API 호출 실패 시 로그아웃 상태로 처리
            set({ isVerified: false, user: null, accessToken: null });
            localStorage.removeItem('user-store');
          });
      },
    }),
    { 
      name: "user-store"
    }
  )
);
