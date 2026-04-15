import type { NextApiRequest, NextApiResponse } from "next";

type KakaoAddressResponse = {
  documents: unknown[];
  meta: { is_end: boolean; pageable_count: number; total_count: number };
};

type KakaoErrorBody = {
  errorType?: string;
  message?: string;
};

type ErrorPayload = { error: string; detail?: string };

function buildKakaoErrorMessage(status: number, body: KakaoErrorBody | null): ErrorPayload {
  const raw = body?.message?.trim() ?? "";
  const errorType = body?.errorType ?? "";

  if (
    errorType === "AccessDeniedError" ||
    /ip\s*mismatch|callerIp|registered\s*ip/i.test(raw)
  ) {
    return {
      error:
        "카카오 앱 설정의 허용 IP에, 지금 주소 검색 요청이 나가는 공인 IP가 등록되어 있지 않습니다.",
      detail:
        raw ||
        "[카카오 디벨로퍼스] 앱 → 앱 설정 → 플랫폼/보안에서 IP 제한을 조정하거나, 개발 PC·배포 서버의 공인 IP를 추가해 주세요.",
    };
  }

  if (status === 401) {
    return {
      error: "카카오 REST API 키가 올바르지 않거나 만료되었을 수 있습니다.",
      detail: raw || undefined,
    };
  }

  return {
    error: "주소 검색 요청에 실패했습니다.",
    detail: raw || `HTTP ${status}`,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KakaoAddressResponse | ErrorPayload>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = req.query.q;
  const query = typeof raw === "string" ? raw.trim() : "";
  if (!query) {
    return res.status(400).json({ error: "검색어(q)가 필요합니다." });
  }

  const apiKey =
    process.env.KAKAO_REST_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error:
        "KAKAO_REST_API_KEY 또는 NEXT_PUBLIC_KAKAO_REST_API_KEY가 설정되지 않았습니다.",
    });
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "15");

  let kakaoRes: Response;
  try {
    kakaoRes = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });
  } catch {
    return res.status(502).json({
      error: "카카오 주소 검색 서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.",
    });
  }

  if (!kakaoRes.ok) {
    let kakaoErr: KakaoErrorBody | null = null;
    try {
      kakaoErr = (await kakaoRes.json()) as KakaoErrorBody;
    } catch {
      /* ignore */
    }
    const payload = buildKakaoErrorMessage(kakaoRes.status, kakaoErr);
    return res.status(502).json(payload);
  }

  const data = (await kakaoRes.json()) as KakaoAddressResponse;
  return res.status(200).json(data);
}
