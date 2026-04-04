export function extractOAuthCode(href: string): string | null {
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
    return null;
  }
  return null;
}
