/**
 * OAuth redirect URL의 `code` 쿼리 값.
 * 백엔드 `/oauth/kakao/login` 요청 body의 `accessToken`에 그대로 사용합니다.
 */
export function extractOAuthCodeAsAccessToken(href: string): string | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    const fromQuery = url.searchParams.get("code");
    if (fromQuery) return fromQuery;
    if (url.hash.length > 1) {
      const fromHash = new URLSearchParams(url.hash.slice(1)).get("code");
      if (fromHash) return fromHash;
    }
  } catch {
    /* ignore */
  }
  return null;
}
