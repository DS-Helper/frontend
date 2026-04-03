import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { getCheckAuth as getUserCheckAuth } from "../apis/authUser";
import { getCheckAuth as getOrgCheckAuth } from "../apis/authOrganization";

interface UserState {
  user: User | null;
  isVerified: boolean;
  userType: "individual" | "organization" | null;
  kakaoOauthActiveCode: string | null;
  /** 백엔드가 code로 발급·반환한 카카오 accessToken (persist 제외) */
  kakaoAccessToken: string | null;
  setUser: (user: User | null) => void;
  setIsVerified: (isVerified: boolean) => void;
  setUserType: (userType: "individual" | "organization" | null) => void;
  claimKakaoOAuthCode: (code: string) => boolean;
  releaseKakaoOAuthCode: (code: string) => void;
  setKakaoAccessToken: (token: string | null) => void;
  checkAuthStatus: () => void;
}

type UserPersistedSlice = Pick<
  UserState,
  "user" | "isVerified" | "userType"
>;

export const useUserStore = create(
  persist<UserState, [], [], UserPersistedSlice>(
    (set, get) => ({
      user: null,
      isVerified: false,
      userType: null,
      kakaoOauthActiveCode: null,
      kakaoAccessToken: null,
      setUser: (user) => set({ user }),
      setIsVerified: (isVerified) => set({ isVerified }),
      setUserType: (userType) => set({ userType }),
      claimKakaoOAuthCode: (code) => {
        if (get().kakaoOauthActiveCode === code) return false;
        set({ kakaoOauthActiveCode: code });
        return true;
      },
      releaseKakaoOAuthCode: (code) => {
        if (get().kakaoOauthActiveCode !== code) return;
        set({ kakaoOauthActiveCode: null });
      },
      setKakaoAccessToken: (token) => set({ kakaoAccessToken: token }),
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
              set({
                isVerified: false,
                user: null,
                userType: null,
                kakaoAccessToken: null,
              });
              localStorage.removeItem('user-store');
            }
          })
          .catch(() => {
            // API 호출 실패 시 로그아웃 상태로 처리
            set({
              isVerified: false,
              user: null,
              userType: null,
              kakaoAccessToken: null,
            });
            localStorage.removeItem('user-store');
          });
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        isVerified: state.isVerified,
        userType: state.userType,
      }),
    }
  )
);
