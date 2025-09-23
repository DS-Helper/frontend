import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { getCookie } from "../utils/cookies";

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
        const token = getCookie('token');
        if (token) {
          set({ isVerified: true });
        } else {
          set({ isVerified: false, user: null, accessToken: null });
        }
      },
    }),
    { name: "user-store" }
  )
);
