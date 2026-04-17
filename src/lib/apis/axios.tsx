import axios, { AxiosHeaders, AxiosInstance } from "axios";
import {
  useUserStore,
  resetUserSession,
} from "../store/userStore";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function formatBearer(raw: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (/^Bearer\s+/i.test(t)) return t;
  return `Bearer ${t}`;
}

function shouldAttachAuthorization(url: string): boolean {
  if (!url) return true;
  const skip = [
    "/oauth/kakao/login",
    "/oauth/google/login",
    "/oauth/naver/login",
    "/auth/login/organization",
  ];
  return !skip.some((p) => url.includes(p));
}

function tokenRawForRequestUrl(
  url: string,
  accessToken: string | null,
  refreshToken: string | null
): string | null {
  if (url.includes("/auth/check-logged-in/organization")) return accessToken;
  if (url.includes("/auth/check-logged-in")) return refreshToken;
  return accessToken;
}

export const instance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    if (!shouldAttachAuthorization(url)) {
      return config;
    }
    const { accessToken, refreshToken } = useUserStore.getState();
    const raw = tokenRawForRequestUrl(url, accessToken, refreshToken);
    const auth = formatBearer(raw);
    if (auth) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set("Authorization", auth, true);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (url.includes("/auth/check-logged-in")) {
        return Promise.reject(error);
      }

      resetUserSession();
    }

    if (error.response?.status === 403) {
      console.error("403 에러: 권한이 없습니다.", error.response?.data);
      const url = error.config?.url || "";
      const isReservationApi =
        url.includes("/personal-reservations") ||
        url.includes("/organization-reservations");
      if (typeof window !== "undefined" && !isReservationApi) {
        alert("해당 기능에 대한 권한이 없습니다. 관리자에게 문의하세요.");
      }
    }

    return Promise.reject(error);
  }
);
