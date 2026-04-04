import { instance } from "./axios";

export const KAKAO_OAUTH_AUTHORIZE_ENDPOINT =
  "https://kauth.kakao.com/oauth/authorize";

/** 카카오 개발자 콘솔에 등록할 redirect 경로(프론트 콜백) */
export const KAKAO_OAUTH_REDIRECT_PATH = "/kakao/callback";

export function getKakaoOAuthRedirectUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  const origin =
    (process.env.NEXT_PUBLIC_APP_ORIGIN ?? "").replace(/\/$/, "") ||
    window.location.origin;
  return `${origin}${KAKAO_OAUTH_REDIRECT_PATH}`;
}

export function getKakaoOAuthCallbackPathname(): string {
  const fromEnv = process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI?.trim();
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
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY_TEST?.trim();
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

export const naverLogin = async (data: any) => {
  try {
    const res = await instance.get("/oauth/naver/login", { params: data });
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

export const googleLogin = async (data: any) => {
  try {
    const res = await instance.get("/oauth/google/login", { params: data });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getCheckAuth = async () => {
  try {
    const res = await instance.get("/auth/check-logged-in");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};
