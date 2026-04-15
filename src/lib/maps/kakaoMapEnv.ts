import type { NextApiRequest } from "next";

/**
 * 카카오 지도 JavaScript 키 — 배포 변수 `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY`를 사용합니다.
 */

const PRODUCTION_HOSTS = new Set(["dshelper.kr", "www.dshelper.kr"]);

export function isKakaoMapProductionHost(hostname: string): boolean {
  const h = hostname.trim().toLowerCase().split(":")[0] ?? "";
  return PRODUCTION_HOSTS.has(h);
}

export function getKakaoMapJavaScriptKeyForHost(hostname: string): string {
  const prodKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY?.trim() ?? "";
  void hostname;
  return prodKey;
}

/** API 라우트에서 `Host` / `X-Forwarded-Host` 기준 호스트명만 추출 */
export function getHostnameFromNextApiRequest(req: NextApiRequest): string {
  const xf = req.headers["x-forwarded-host"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0]?.trim()?.split(":")[0] ?? "";
  }
  if (Array.isArray(xf) && xf[0]) {
    return xf[0].split(",")[0]?.trim()?.split(":")[0] ?? "";
  }
  const host = req.headers.host ?? "";
  return host.split(":")[0] ?? "";
}
