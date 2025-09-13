import { create } from "zustand";
import { User } from "@/types/userType"

interface UserState {
  user: User | null;
  isVerified: boolean;
  accessToken: string | null;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setIsVerified: (isVerified: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user: User) => set({ user }),
  isVerified: true,
  setIsVerified: (isVerified: boolean) => set({ isVerified }),
}));
