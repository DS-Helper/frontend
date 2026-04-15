import type { NextApiRequest, NextApiResponse } from "next";
import {
  getHostnameFromNextApiRequest,
  getKakaoMapJavaScriptKeyForHost,
} from "@/lib/maps/kakaoMapEnv";

/**
 * 브라우저 CORS 없이 카카오 지도 SDK URL 응답 코드를 확인합니다.
 * 401이면 JavaScript 키·Web 도메인 설정 문제일 가능성이 큽니다.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ status: number | null }>
) {
  const hostname = getHostnameFromNextApiRequest(req);
  const appKey = getKakaoMapJavaScriptKeyForHost(hostname);
  if (!appKey) {
    res.status(200).json({ status: null });
    return;
  }

  const url = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
    appKey
  )}&autoload=false`;

  try {
    let r = await fetch(url, { method: "HEAD", cache: "no-store" });

    if (r.status === 405 || r.status === 501) {
      r = await fetch(url, { method: "GET", cache: "no-store" });
    }

    res.status(200).json({ status: r.status });
  } catch {
    res.status(200).json({ status: null });
  }
}
