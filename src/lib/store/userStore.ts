import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { getCheckAuth as getUserCheckAuth } from "../apis/authUser";
import { getCheckAuth as getOrgCheckAuth } from "../apis/authOrganization";

interface UserState {
  user: User | null;
  isVerified: boolean;
  userType: 'individual' | 'organization' | null;
  setUser: (user: User | null) => void;
  setIsVerified: (isVerified: boolean) => void;
  setUserType: (userType: 'individual' | 'organization' | null) => void;
  checkAuthStatus: () => void;
}

export const useUserStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      isVerified: false,
      userType: null,
      setUser: (user) => set({ user }),
      setIsVerified: (isVerified) => set({ isVerified }),
      setUserType: (userType) => {
        console.log('userStore - setUserType 호출됨:', userType);
        set({ userType });
      },
      checkAuthStatus: () => {
        const { userType, isVerified } = get();
        
        // 이미 로그인 상태이고 사용자 타입이 설정되어 있으면 API 호출하지 않음
        if (isVerified && userType) {
          return;
        }
        
        // 사용자 타입에 따라 적절한 API 호출
        const checkAuthPromise = userType === 'organization' 
          ? getOrgCheckAuth() 
          : getUserCheckAuth();
          
        checkAuthPromise
          .then((response) => {
            if (response && response.data === true) {
              // 서버에서 로그인 상태 확인됨 (true = 로그인)
              set({ isVerified: true });
            } else {
              // 서버에서 로그아웃 상태 확인됨 (false = 로그아웃)
              set({ isVerified: false, user: null, userType: null });
              localStorage.removeItem('user-store');
            }
          })
          .catch(() => {
            // API 호출 실패 시 로그아웃 상태로 처리
            set({ isVerified: false, user: null, userType: null });
            localStorage.removeItem('user-store');
          });
      },
    }),
    { 
      name: "user-store"
    }
  )
);
