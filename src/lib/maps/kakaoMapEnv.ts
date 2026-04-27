import type { NextApiRequest } from "next";
import { pickValueByHost } from "@/lib/config/domainEnv";

export function getKakaoMapJavaScriptKeyForHost(hostname: string): string {
  return pickValueByHost(
    hostname,
    process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY,
    process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST
  );
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
