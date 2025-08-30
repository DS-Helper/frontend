import { create } from "zustand";
import { User } from "@/types/userType"

interface UserState {
  user: User | null;
  isVerified: boolean;
  setUser: (user: User) => void;
  setIsVerified: (isVerified: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "user1",
    name: "홍길동",
    email: "hong@example.com",
    type: "개인"
  },
  setUser: (user: User) => set({ user }),
  isVerified: true,
  setIsVerified: (isVerified: boolean) => set({ isVerified }),
}));
