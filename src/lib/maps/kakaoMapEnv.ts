import type { NextApiRequest } from "next";

/**
 * 카카오 지도 JavaScript 키 — `.env`의 `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY`를 사용합니다.
 * (로컬/스테이징/배포는 환경별 `.env`에 서로 다른 값을 넣어 구분합니다.)
 */

export function getKakaoMapJavaScriptKeyForHost(_hostname: string): string {
  void _hostname;
  return process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY?.trim() ?? "";
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
