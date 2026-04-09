import { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/TrashBinList.module.scss";
import { getKakaoMapLoadErrorMessage, loadKakaoMapSdk } from "@/lib/maps/loadKakaoMapSdk";

const cn = classNames.bind(styles);

/** 달성군 일대 기준 — 위치 미허용 시 이 근처에서 임의 중심을 뽑습니다 */
const DEFAULT_CENTER = { lat: 35.7742, lng: 128.4311 };

function randomFallbackCenter(): { lat: number; lng: number } {
  const dLat = (Math.random() - 0.5) * 0.04;
  const dLng = (Math.random() - 0.5) * 0.05;
  return {
    lat: DEFAULT_CENTER.lat + dLat,
    lng: DEFAULT_CENTER.lng + dLng,
  };
}

function resolveMapCenter(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(randomFallbackCenter());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => resolve(randomFallbackCenter()),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
    );
  });
}

/** 백엔드 연동 전 임시 휴지통 핀 (좌표만) */
const MOCK_TRASH_BINS: { id: string; lat: number; lng: number }[] = [
  { id: "mock-1", lat: 35.7751, lng: 128.4302 },
  { id: "mock-2", lat: 35.7736, lng: 128.4275 },
  { id: "mock-3", lat: 35.7758, lng: 128.4268 },
  { id: "mock-4", lat: 35.7729, lng: 128.4315 },
];

export default function TrashBinListMapView() {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMaps.Map | null>(null);
  const markersRef = useRef<KakaoMaps.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    const appKey = (process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST ?? "").trim();
    if (!appKey) {
      setMapError(
        "지도를 표시하려면 환경 변수 NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY(카카오 JavaScript 키)가 필요합니다."
      );
      return;
    }

    let cancelled = false;

    void (async () => {
      const centerCoords = await resolveMapCenter();
      if (cancelled) return;

      try {
        await loadKakaoMapSdk(appKey);
      } catch (e) {
        if (!cancelled) {
          setMapError(getKakaoMapLoadErrorMessage(e));
        }
        return;
      }

      if (cancelled || !mapElRef.current || !window.kakao?.maps) {
        if (!cancelled) {
          setMapError(getKakaoMapLoadErrorMessage(new Error("KAKAO_MAP_SDK_LOAD_FAILED")));
        }
        return;
      }

      const { maps } = window.kakao;
      const center = new maps.LatLng(centerCoords.lat, centerCoords.lng);
      const map = new maps.Map(mapElRef.current, { center, level: 5 });
      mapInstanceRef.current = map;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = MOCK_TRASH_BINS.map(
        (p) =>
          new maps.Marker({
            map,
            position: new maps.LatLng(p.lat, p.lng),
          })
      );

      requestAnimationFrame(() => map.relayout());
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className={cn("mapShell")}>
      {mapError && (
        <p className={cn("mapErrorBanner")} role="alert">
          {mapError}
        </p>
      )}

      <div ref={mapElRef} className={cn("mapContainer")} aria-label="휴지통 지도" />
    </div>
  );
}
