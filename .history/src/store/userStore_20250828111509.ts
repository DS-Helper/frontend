import { create } from "zustand";


interface UserState {
  user: User | null;
  isVerified: boolean;
  setUser: (user: User) => void;
  setIsVerified: (isVerified: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  isVerified: false,
  setIsVerified: (isVerified: boolean) => set({ isVerified }),
}));
