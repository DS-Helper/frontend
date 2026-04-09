/**
 * 카카오 지도 SDK 스크립트 로드 (`autoload=false` 후 `kakao.maps.load`).
 * 호출부에서 전달하는 appKey는 보통 `kakaoMapEnv.getKakaoMapJavaScriptKeyForHost(호스트)` 결과입니다. REST API 키는 사용할 수 없습니다.
 */

export const KAKAO_MAP_SDK_UNAUTHORIZED = "KAKAO_MAP_SDK_UNAUTHORIZED";
export const KAKAO_MAP_SDK_LOAD_FAILED = "KAKAO_MAP_SDK_LOAD_FAILED";

export function getKakaoMapLoadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === KAKAO_MAP_SDK_UNAUTHORIZED) {
    return (
      "카카오 지도 인증(401)에 실패했습니다. 카카오 디벨로퍼스 해당 앱의 JavaScript 키를 쓰고 있는지 확인하고(REST API 키는 불가), [플랫폼] > Web에 지금 접속 중인 주소를 그대로 등록했는지 확인해 주세요. " +
      "개발 시에는 예: http://localhost:3000 — 포트까지 동일해야 합니다. 수정 후 개발 서버를 재시작하세요."
    );
  }
  return "지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

async function fetchSdkHttpStatusFromApi(): Promise<number | null> {
  try {
    const r = await fetch("/api/kakao-map-sdk-check", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { status: number | null };
    return typeof j.status === "number" ? j.status : null;
  } catch {
    return null;
  }
}

async function rejectLoadFailure(): Promise<never> {
  const st = await fetchSdkHttpStatusFromApi();
  if (st === 401) {
    throw new Error(KAKAO_MAP_SDK_UNAUTHORIZED);
  }
  throw new Error(KAKAO_MAP_SDK_LOAD_FAILED);
}

export async function loadKakaoMapSdk(appKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Map SDK는 브라우저에서만 로드할 수 있습니다."));
  }

  const key = appKey.trim();
  if (!key) {
    return Promise.reject(
      new Error(
        "현재 도메인에 맞는 카카오 지도 JavaScript 키(NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY / _TEST)가 없습니다."
      )
    );
  }

  const preflightStatus = await fetchSdkHttpStatusFromApi();
  if (preflightStatus === 401) {
    return Promise.reject(new Error(KAKAO_MAP_SDK_UNAUTHORIZED));
  }

  const w = window;

  const afterScriptLoaded = () =>
    new Promise<void>((resolve, reject) => {
      if (!w.kakao?.maps) {
        void rejectLoadFailure().catch(reject);
        return;
      }
      w.kakao.maps.load(() => resolve());
    });

  if (w.kakao?.maps) {
    return afterScriptLoaded();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-maps-sdk='1']"
    );

    const onReady = () => {
      void afterScriptLoaded().then(resolve).catch(reject);
    };

    if (existing) {
      if (w.kakao?.maps) {
        onReady();
      } else {
        existing.addEventListener("load", onReady, { once: true });
        existing.addEventListener(
          "error",
          () => {
            void rejectLoadFailure().catch(reject);
          },
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMapsSdk = "1";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      key
    )}&autoload=false&libraries=services`;
    script.onload = onReady;
    script.onerror = () => {
      void rejectLoadFailure().catch(reject);
    };
    document.head.appendChild(script);
  });
}
