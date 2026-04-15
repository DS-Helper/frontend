import type { NextApiRequest } from "next";

/**
 * 카카오 지도 JavaScript 키 — **접속 호스트**로 운영/테스트 키를 고릅니다.
 *
 * - `dshelper.kr` / `www.dshelper.kr` → `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY`(배포)
 * - 그 외(localhost, 스테이징, preview 등) → `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST`(테스트)
 * - 해당 키가 비어 있으면 반대쪽 키로 폴백합니다.
 */

const PRODUCTION_HOSTS = new Set(["dshelper.kr", "www.dshelper.kr"]);

export function isKakaoMapProductionHost(hostname: string): boolean {
  const h = hostname.trim().toLowerCase().split(":")[0] ?? "";
  return PRODUCTION_HOSTS.has(h);
}

export function getKakaoMapJavaScriptKeyForHost(hostname: string): string {
  const prodKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY?.trim() ?? "";
  const testKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST?.trim() ?? "";

  if (isKakaoMapProductionHost(hostname)) {
    return prodKey || testKey;
  }
  return testKey || prodKey;
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
