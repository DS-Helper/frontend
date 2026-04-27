import { instance } from "./axios";
import { useUserStore } from "../store/userStore";
import { getClientHostname, isTestHost, pickValueByHost } from "../config/domainEnv";

export const KAKAO_OAUTH_AUTHORIZE_ENDPOINT =
  "https://kauth.kakao.com/oauth/authorize";

/** 카카오 개발자 콘솔에 등록할 redirect 경로(프론트 콜백) */
export const KAKAO_OAUTH_REDIRECT_PATH = "/kakao/callback";

export const GOOGLE_OAUTH_REDIRECT_PATH = "/google/callback";
export const NAVER_OAUTH_REDIRECT_PATH = "/naver/callback";

function getAppOrigin(): string {
  if (typeof window === "undefined") return "";
  const hostname = getClientHostname();
  const appOrigin = pickValueByHost(
    hostname,
    process.env.NEXT_PUBLIC_APP_ORIGIN,
    process.env.NEXT_PUBLIC_TEST_APP_ORIGIN
  );
  return appOrigin.replace(/\/$/, "") || window.location.origin;
}

function resolveOAuthRedirectUri(
  productionUrl: string | undefined,
  testUrl: string | undefined,
  pathname: string
): string {
  const currentHost = getClientHostname();
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin.replace(/\/$/, "");
    // test 도메인에서는 현재 호스트 callback을 강제해 잘못된 env 고정값을 방지한다.
    if (isTestHost(currentHost)) {
      return `${currentOrigin}${pathname}`;
    }
  }
  const fromEnv = pickValueByHost(currentHost, productionUrl, testUrl);
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  return `${getAppOrigin()}${pathname}`;
}

export function getKakaoOAuthRedirectUri(): string {
  return resolveOAuthRedirectUri(
    process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI,
    process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI_TEST,
    KAKAO_OAUTH_REDIRECT_PATH
  );
}

export function getGoogleOAuthRedirectUri(): string {
  return resolveOAuthRedirectUri(
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI,
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI_TEST,
    GOOGLE_OAUTH_REDIRECT_PATH
  );
}

export function getNaverOAuthRedirectUri(): string {
  return resolveOAuthRedirectUri(
    process.env.NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI,
    process.env.NEXT_PUBLIC_NAVER_OAUTH_REDIRECT_URI_TEST,
    NAVER_OAUTH_REDIRECT_PATH
  );
}

export function getKakaoOAuthCallbackPathname(): string {
  const fromEnv = pickValueByHost(
    getClientHostname(),
    process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI,
    process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI_TEST
  );
  if (fromEnv) {
    try {
      return new URL(fromEnv).pathname || KAKAO_OAUTH_REDIRECT_PATH;
    } catch {
      return KAKAO_OAUTH_REDIRECT_PATH;
    }
  }
  return KAKAO_OAUTH_REDIRECT_PATH;
}

export function buildKakaoAuthorizeUrl(): string {
  const clientId = pickValueByHost(
    getClientHostname(),
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST
  );
  if (!clientId) {
    throw new Error(
      ".env에 NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST(카카오 REST API 키)를 설정하세요."
    );
  }
  const redirectUri = getKakaoOAuthRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${KAKAO_OAUTH_AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export const getLogin = async (code: string) => {
  try {
    const res = await instance.post("/oauth/kakao/login", {
      code,
    });
    console.log("[oauth/kakao/login] response.data", res.data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const naverLoginUrl = async () => {
  try {
    const res = await instance.get("/oauth/naver/login-url");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const googleLoginUrl = async () => {
  try {
    const res = await instance.get("/oauth/google/login-url");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export function pickOAuthLoginUrl(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") {
    const s = data.trim();
    return s || null;
  }
  if (typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const key of ["url", "loginUrl", "redirectUrl"] as const) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeOAuthAuthorizeUrl(url: string): string {
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) {
    const base = pickValueByHost(
      getClientHostname(),
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NEXT_PUBLIC_TEST_API_URL
    );
    const normalized = base.replace(/\/$/, "");
    return normalized ? `${normalized}${u}` : u;
  }
  return u;
}

/** 백엔드가 내려준 authorize URL의 redirect_uri를 프론트 콜백으로 맞춥니다. */
export function replaceOAuthAuthorizeRedirectUri(
  authorizeUrl: string,
  redirectUri: string
): string {
  try {
    const u = new URL(authorizeUrl);
    u.searchParams.set("redirect_uri", redirectUri);
    return u.toString();
  } catch {
    return authorizeUrl;
  }
}

export async function getGoogleOAuthStartUrl(): Promise<string> {
  const res = await googleLoginUrl();
  const raw = pickOAuthLoginUrl(res?.data);
  if (!raw) throw new Error("구글 로그인 URL을 받아오지 못했습니다.");
  const absolute = normalizeOAuthAuthorizeUrl(raw);
  return replaceOAuthAuthorizeRedirectUri(
    absolute,
    getGoogleOAuthRedirectUri()
  );
}

export async function getNaverOAuthStartUrl(): Promise<string> {
  const res = await naverLoginUrl();
  const raw = pickOAuthLoginUrl(res?.data);
  if (!raw) throw new Error("네이버 로그인 URL을 받아오지 못했습니다.");
  const absolute = normalizeOAuthAuthorizeUrl(raw);
  return replaceOAuthAuthorizeRedirectUri(
    absolute,
    getNaverOAuthRedirectUri()
  );
}

export const naverLogin = async (body: { code: string; state: string }) => {
  try {
    const res = await instance.post("/oauth/naver/login", body);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const googleLogin = async (body: { code: string }) => {
  try {
    const res = await instance.post("/oauth/google/login", body);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getCheckAuth = async () => {
  try {
    const { refreshToken } = useUserStore.getState();
    const normalizedRefreshToken =
      typeof refreshToken === "string" && refreshToken.trim()
        ? refreshToken.trim()
        : undefined;
    if (!normalizedRefreshToken) return null;

    const res = await instance.get("/auth/check-logged-in", {
      headers: { refreshToken: normalizedRefreshToken },
    });
    return res;
  } catch {
    return null;
  }
};
