import { create } from "zustand";
import { User } from "@/types/userType";
import { persist } from "zustand/middleware";
import { getCheckAuth as getUserCheckAuth } from "../apis/authUser";
import { getCheckAuth as getOrgCheckAuth } from "../apis/authOrganization";

interface UserState {
  user: User | null;
  isVerified: boolean;
  userType: "individual" | "organization" | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setIsVerified: (isVerified: boolean) => void;
  setUserType: (userType: "individual" | "organization" | null) => void;
  checkAuthStatus: () => void;
}

type UserPersistedSlice = Pick<
  UserState,
  "user" | "isVerified" | "userType" | "accessToken" | "refreshToken"
>;

function normalizeToken(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

export const useUserStore = create(
  persist<UserState, [], [], UserPersistedSlice>(
    (set, get) => ({
      user: null,
      isVerified: false,
      userType: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setIsVerified: (isVerified) => set({ isVerified }),
      setUserType: (userType) => set({ userType }),
      checkAuthStatus: () => {
        const { userType, isVerified } = get();

        if (isVerified && userType) {
          return;
        }

        const checkAuthPromise =
          userType === "organization" ? getOrgCheckAuth() : getUserCheckAuth();

        checkAuthPromise
          .then((response) => {
            if (response && response.data === true) {
              set({ isVerified: true });
            } else {
              set({
                isVerified: false,
                user: null,
                userType: null,
                accessToken: null,
                refreshToken: null,
              });
            }
          })
          .catch(() => {
            set({
              isVerified: false,
              user: null,
              userType: null,
              accessToken: null,
              refreshToken: null,
            });
          });
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        isVerified: state.isVerified,
        userType: state.userType,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export function applyLoginResponseTokens(body: unknown): void {
  if (body == null || typeof body !== "object") return;
  const o = body as Record<string, unknown>;
  const nested =
    o.data != null && typeof o.data === "object"
      ? (o.data as Record<string, unknown>)
      : null;

  const access =
    normalizeToken(o.accessToken) ||
    normalizeToken(o.access_token) ||
    normalizeToken(o.token) ||
    (nested &&
      (normalizeToken(nested.accessToken) ||
        normalizeToken(nested.access_token) ||
        normalizeToken(nested.token)));

  const refresh =
    normalizeToken(o.refreshToken) ||
    normalizeToken(o.refresh_token) ||
    (nested &&
      (normalizeToken(nested.refreshToken) ||
        normalizeToken(nested.refresh_token)));

  const patch: Partial<Pick<UserState, "accessToken" | "refreshToken">> = {};
  if (access) patch.accessToken = access;
  if (refresh) patch.refreshToken = refresh;
  if (Object.keys(patch).length === 0) return;
  useUserStore.setState(patch);
}

export function clearAuthCredentials(): void {
  useUserStore.setState({ accessToken: null, refreshToken: null });
}

export function resetUserSession(): void {
  useUserStore.setState({
    user: null,
    isVerified: false,
    userType: null,
    accessToken: null,
    refreshToken: null,
  });
}
