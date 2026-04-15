const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function isUsableImageSrc(src: string | null | undefined): src is string {
  if (typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase().includes("null")) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function resolveProfileImageSrc(
  src: string | null | undefined,
  fallback = "/userIcon.svg"
): string {
  return isUsableImageSrc(src) ? src.trim() : fallback;
}
