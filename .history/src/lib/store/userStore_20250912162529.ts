import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  isVerified: boolean;
  accessToken: string | null;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setIsVerified: (isVerified: boolean) => void;
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
    }),
    { name: "user-store" }
  )
);
