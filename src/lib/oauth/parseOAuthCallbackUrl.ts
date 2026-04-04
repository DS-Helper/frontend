import { extractOAuthCode } from "./extractOAuthCode";

export type OAuthCallbackParsed = {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
  state: string | null;
};

/**
 * OAuth 콜백 URL에서 query string을 파싱합니다.
 * `code`는 Kakao가 hash 대신 query로 주는 경우가 일반적이나, hash에도 있을 수 있어 extractOAuthCode와 병행합니다.
 */
export function parseOAuthCallbackUrl(href: string): OAuthCallbackParsed {
  const code = extractOAuthCode(href);
  try {
    const url = new URL(href);
    return {
      code,
      error: url.searchParams.get("error"),
      errorDescription: url.searchParams.get("error_description"),
      state: url.searchParams.get("state"),
    };
  } catch {
    return {
      code,
      error: null,
      errorDescription: null,
      state: null,
    };
  }
}
