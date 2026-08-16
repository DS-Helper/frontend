import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/ToiletList.module.scss";
import { getKakaoMapJavaScriptKeyForHost } from "@/lib/maps/kakaoMapEnv";
import { getKakaoMapLoadErrorMessage, loadKakaoMapSdk } from "@/lib/maps/loadKakaoMapSdk";
import type { PublicToiletApiItem, ToiletPlace } from "@/types/toilet";
import { getNearbyToilets } from "@/lib/apis/toilet";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import shareIcon from "@/public/shareIcon.svg";
import cctvIcon from "@/public/cctvICon.svg";
import diaperChangingTableIcon from "@/public/diaperChangingTableIcon.svg";

const cn = classNames.bind(styles);

const PIN_SIZE = { width: 35, height: 53 };
const PIN_ANCHOR = { x: 17, y: 53 };
const BADGE_ICON_SIZE = 30;

/** 화장실 종류(categoryName)별 배지 배경색 */
const CATEGORY_BADGE_BACKGROUND: Record<string, string> = {
  공중화장실: "#1677FF",
  개방화장실: "#FA8C16",
};
const DEFAULT_CATEGORY_BADGE_BACKGROUND = "var(--color-semantic-bg-brand)";

function getCategoryBadgeBackground(categoryName: string): string {
  return CATEGORY_BADGE_BACKGROUND[categoryName] ?? DEFAULT_CATEGORY_BADGE_BACKGROUND;
}

/** 바텀시트 열림/닫힘 애니메이션 (ms) — SCSS duration과 맞춤 */
const SHEET_ANIM_MS = 340;
const SHEET_BACKDROP_ANIM_MS = 280;
const SHEET_CLOSE_MS = Math.max(SHEET_ANIM_MS, SHEET_BACKDROP_ANIM_MS);

/** 위치 안내 confirm — 최초 1회만 */
const GEO_CONSENT_STORAGE_KEY = "factory.toilet.geoConsentAsked";

/** 이 거리(m) 이상 이동해야 기준 좌표를 갱신하고 nearby를 다시 조회함 — GPS 흔들림으로 인한 과호출 방지 */
const LOCATION_REFRESH_DISTANCE_METERS = 200;

function formatOpeningHours(item: PublicToiletApiItem): string {
  const hours = item.openingHours.trim();
  const detail = item.openingHoursDetail.trim();
  if (hours && detail && hours !== detail) return `${hours} · ${detail}`;
  return hours || detail || "운영시간 정보 없음";
}

function toiletApiToPlace(item: PublicToiletApiItem): ToiletPlace {
  const addressFallback = item.roadAddress.trim() || item.parcelAddress.trim();

  return {
    id: item.id,
    lat: item.latitude,
    lng: item.longitude,
    name: item.toiletName.trim() || addressFallback || "화장실",
    categoryLabel: item.categoryName.trim() || "화장실",
    openingHours: formatOpeningHours(item),
    address: addressFallback || "주소 정보 없음",
    hasCctv: item.entranceCctvYn === "Y",
    hasDiaperTable: item.diaperChangingTableYn === "Y",
  };
}

function openKakaoMapLink(path: "to" | "from", place: ToiletPlace) {
  const url = `https://map.kakao.com/link/${path}/${encodeURIComponent(place.address)},${place.lat},${place.lng}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusM = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

async function shareToiletPlace(place: ToiletPlace) {
  const url = `https://map.kakao.com/link/map/${place.lat},${place.lng}`;
  const shareData = { title: place.name, text: place.name, url };
  try {
    if (typeof navigator.share === "function") {
      await navigator.share(shareData);
      return;
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      alert("위치 링크가 복사되었어요.");
    }
  } catch {
    /* 사용자가 공유를 취소한 경우 */
  }
}

export default function ToiletListMapView() {
  const router = useRouter();

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMaps.Map | null>(null);
  const markersRef = useRef<KakaoMaps.Marker[]>([]);
  const isMapDraggingRef = useRef(false);
  const ignoreMapClickUntilRef = useRef(0);
  /** 마커 클릭 직후 지도 click으로 바텀시트가 바로 닫히지 않게 함 */
  const blockMapDeselectRef = useRef(false);
  const didInitMapRef = useRef(false);
  /** 지도 최초 중심 — 최초 GPS 1회만 고정 */
  const mapInitCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const hasFirstFixRef = useRef(false);
  const lastReferenceRef = useRef<{ lat: number; lng: number } | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDirectionsSheetOpen, setIsDirectionsSheetOpen] = useState(false);
  const [isSheetClosing, setIsSheetClosing] = useState(false);
  const sheetCloseTimerRef = useRef<number | null>(null);
  /** 현재 기준 좌표 (거리 표시·지도 최초 중심) — 일정 거리 이상 이동하면 갱신됨 */
  const [referenceLocation, setReferenceLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  /** 현재 지도에 보이는 영역(중심·반경) — 지도가 멈출 때(idle)마다 갱신되어 nearby 조회 기준이 됨 */
  const [viewportQuery, setViewportQuery] = useState<{
    lat: number;
    lng: number;
    radiusMeters: number;
  } | null>(null);

  /** 위치 권한 허용 후에만 지도·API 조회 */
  const [geoGateOk, setGeoGateOk] = useState(false);

  const toiletsQuery = useQuery({
    queryKey: [
      "toiletsNearby",
      viewportQuery?.lat,
      viewportQuery?.lng,
      viewportQuery?.radiusMeters,
    ],
    queryFn: async () => {
      if (!viewportQuery) return null;
      const items = await getNearbyToilets(
        viewportQuery.lat,
        viewportQuery.lng,
        viewportQuery.radiusMeters
      );
      if (items == null) {
        throw new Error("TOILETS_FETCH_FAILED");
      }
      return items;
    },
    enabled: geoGateOk && viewportQuery != null,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const toiletsError = toiletsQuery.isError
    ? "화장실 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
    : null;
  const places = useMemo(
    () => (toiletsQuery.data ?? []).map(toiletApiToPlace),
    [toiletsQuery.data]
  );

  /** nearby 응답에 상세 필드가 이미 모두 포함돼 있어 클릭 시 단건 재조회는 하지 않음 */
  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId]
  );

  const clearSheetCloseTimer = useCallback(() => {
    if (sheetCloseTimerRef.current != null) {
      window.clearTimeout(sheetCloseTimerRef.current);
      sheetCloseTimerRef.current = null;
    }
  }, []);

  const closeBottomSheet = useCallback(() => {
    if (!selectedId || isSheetClosing) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const closeMs = reducedMotion ? 0 : SHEET_CLOSE_MS;

    setIsSheetClosing(true);
    clearSheetCloseTimer();
    sheetCloseTimerRef.current = window.setTimeout(() => {
      setSelectedId(null);
      setIsDirectionsSheetOpen(false);
      setIsSheetClosing(false);
      sheetCloseTimerRef.current = null;
    }, closeMs);
  }, [clearSheetCloseTimer, isSheetClosing, selectedId]);

  const closeBottomSheetRef = useRef(closeBottomSheet);
  closeBottomSheetRef.current = closeBottomSheet;

  useEffect(() => {
    return () => clearSheetCloseTimer();
  }, [clearSheetCloseTimer]);

  useEffect(() => {
    if (!selectedId && !isSheetClosing) {
      setIsDirectionsSheetOpen(false);
    }
  }, [isSheetClosing, selectedId]);

  const selectedPlaceDistanceLabel = useMemo(() => {
    if (!selectedPlace || !referenceLocation) return null;
    const meters = distanceMeters(
      referenceLocation.lat,
      referenceLocation.lng,
      selectedPlace.lat,
      selectedPlace.lng
    );
    return formatDistanceLabel(meters);
  }, [referenceLocation, selectedPlace]);

  /**
   * 진입 시 위치 권한 1회 요청 → 허용 시 위치를 지속 감시.
   * 최초 좌표는 지도 중심·geoGate 확정에 사용하고, 이후 LOCATION_REFRESH_DISTANCE_METERS
   * 이상 이동할 때마다 기준 좌표를 갱신해 nearby를 다시 조회한다 (지도 중심은 최초 1회만 고정).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const goHome = () => {
      void router.replace("/");
    };

    const applyPosition = (lat: number, lng: number) => {
      if (cancelled) return;
      const point = { lat, lng };

      if (!hasFirstFixRef.current) {
        hasFirstFixRef.current = true;
        lastReferenceRef.current = point;
        mapInitCenterRef.current = point;
        setReferenceLocation(point);
        setGeoGateOk(true);
        return;
      }

      const last = lastReferenceRef.current;
      const moved = last ? distanceMeters(last.lat, last.lng, lat, lng) : Infinity;
      if (moved < LOCATION_REFRESH_DISTANCE_METERS) return;

      lastReferenceRef.current = point;
      setReferenceLocation(point);
    };

    const startWatching = () => {
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => applyPosition(pos.coords.latitude, pos.coords.longitude),
        () => {
          /** 최초 좌표를 아직 못 얻은 경우에만 치명적 오류로 처리 */
          if (cancelled || hasFirstFixRef.current) return;
          alert("근처 화장실 안내를 위해 위치 권한이 필요해요. 홈 화면으로 이동합니다.");
          goHome();
        },
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
      );
    };

    void (async () => {
      if (!navigator.geolocation) {
        alert(
          "이 기기에서는 위치 정보를 사용할 수 없어요. 근처 화장실 기능은 위치 허용이 필요합니다."
        );
        goHome();
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (cancelled) return;

        if (permission.state === "denied") {
          alert("위치 권한이 꺼져 있어요. 설정에서 허용한 뒤 다시 시도해 주세요.");
          goHome();
          return;
        }

        if (permission.state === "granted") {
          startWatching();
          return;
        }
      } catch {
        /* Permissions API 미지원 브라우저 — 아래 confirm 후 watchPosition */
      }

      const hasAskedBefore = window.localStorage.getItem(GEO_CONSENT_STORAGE_KEY) === "1";
      if (!hasAskedBefore) {
        const accepted = window.confirm(
          "근처 화장실을 지도에 표시하려면 현재 위치 접근이 필요해요. 위치를 허용할까요?"
        );
        window.localStorage.setItem(GEO_CONSENT_STORAGE_KEY, "1");
        if (!accepted) {
          goHome();
          return;
        }
      }

      startWatching();
    })();

    return () => {
      cancelled = true;
      if (geoWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, [router]);

  /** 카카오 지도 초기화 — 위치 허용·좌표 확정 후 1회만 */
  useEffect(() => {
    if (!geoGateOk || didInitMapRef.current) return;

    const el = mapElRef.current;
    if (!el) return;

    const initialCenter = mapInitCenterRef.current;
    if (!initialCenter) return;

    const appKey = getKakaoMapJavaScriptKeyForHost(window.location.hostname);
    if (!appKey) {
      setMapError(
        "지도를 표시하려면 .env에 NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY_TEST(카카오 JavaScript 키)를 설정해 주세요."
      );
      return;
    }

    let cancelled = false;

    void (async () => {
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
      const center = new maps.LatLng(initialCenter.lat, initialCenter.lng);
      const map = new maps.Map(mapElRef.current, { center, level: 5 });
      mapInstanceRef.current = map;

      maps.event.addListener(map, "dragstart", () => {
        isMapDraggingRef.current = true;
        ignoreMapClickUntilRef.current = Date.now() + 120;
      });
      maps.event.addListener(map, "dragend", () => {
        isMapDraggingRef.current = false;
        ignoreMapClickUntilRef.current = Date.now() + 220;
      });

      maps.event.addListener(map, "click", () => {
        if (isMapDraggingRef.current || Date.now() < ignoreMapClickUntilRef.current) {
          return;
        }
        if (blockMapDeselectRef.current) return;
        closeBottomSheetRef.current();
      });

      /** 지도가 멈출 때(드래그·줌 종료)마다 현재 보이는 영역 기준으로 nearby 재조회 */
      const syncViewportQuery = () => {
        const bounds = map.getBounds();
        const viewCenter = map.getCenter();
        const ne = bounds.getNorthEast();
        const radiusMeters = distanceMeters(
          viewCenter.getLat(),
          viewCenter.getLng(),
          ne.getLat(),
          ne.getLng()
        );
        setViewportQuery({ lat: viewCenter.getLat(), lng: viewCenter.getLng(), radiusMeters });
      };
      maps.event.addListener(map, "idle", syncViewportQuery);
      syncViewportQuery();

      if (!cancelled) {
        didInitMapRef.current = true;
        setMapReady(true);
      }
      requestAnimationFrame(() => map.relayout());
    })();

    return () => {
      cancelled = true;
      didInitMapRef.current = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [geoGateOk]);

  /**
   * 지도 컨테이너 크기 변화(헤더/푸터 레이아웃 확정, 모바일 주소창 접힘 등) 대응.
   * 초기 relayout() 이후 컨테이너가 커지면 타일이 옛 크기로 멈춰 하단이 비어 보이는 문제를 막는다.
   */
  useEffect(() => {
    if (!mapReady) return;
    const el = mapElRef.current;
    const map = mapInstanceRef.current;
    if (!el || !map) return;

    const relayout = () => map.relayout();

    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(el);
    window.addEventListener("resize", relayout);
    window.addEventListener("orientationchange", relayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", relayout);
      window.removeEventListener("orientationchange", relayout);
    };
  }, [mapReady]);

  /** 화장실 마커 동기화 */
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.kakao?.maps) return;
    const map = mapInstanceRef.current;
    const { maps } = window.kakao;
    const pinIconSrc = `${window.location.origin}/toiletPin.svg`;
    const markerSize = new maps.Size(PIN_SIZE.width, PIN_SIZE.height);
    const markerOffset = new maps.Point(PIN_ANCHOR.x, PIN_ANCHOR.y);
    const pinImage = new maps.MarkerImage(pinIconSrc, markerSize, {
      offset: markerOffset,
    });

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = places.map((place) => {
      const marker = new maps.Marker({
        map,
        position: new maps.LatLng(place.lat, place.lng),
        image: pinImage,
      });
      maps.event.addListener(marker, "click", () => {
        blockMapDeselectRef.current = true;
        clearSheetCloseTimer();
        setIsSheetClosing(false);
        setIsDirectionsSheetOpen(false);
        setSelectedId(place.id);
        window.setTimeout(() => {
          blockMapDeselectRef.current = false;
        }, 0);
      });
      return marker;
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [clearSheetCloseTimer, mapReady, places]);

  const isLoadingToilets =
    geoGateOk && (toiletsQuery.isLoading || toiletsQuery.isFetching) && places.length === 0;

  return (
    <div className={cn("mapShell")}>
      {(mapError || toiletsError) && (
        <p className={cn("mapErrorBanner")} role="alert">
          {mapError ?? toiletsError}
        </p>
      )}

      {!geoGateOk && (
        <div className={cn("geoCheckingPanel")} aria-live="polite">
          <p className={cn("geoCheckingMessage")}>위치 권한 확인 중입니다…</p>
        </div>
      )}

      {geoGateOk && (
        <div ref={mapElRef} className={cn("mapContainer")} aria-label="화장실 지도" />
      )}

      {isLoadingToilets && (
        <div className={cn("toiletsLoadingBanner")} aria-live="polite">
          <p className={cn("toiletsLoadingBannerText")}>화장실 정보를 불러오는 중입니다…</p>
        </div>
      )}

      {geoGateOk && selectedPlace && (
        <>
          <button
            type="button"
            className={cn("bottomSheetBackdrop", {
              bottomSheetBackdropClosing: isSheetClosing,
            })}
            aria-label="상세 닫기"
            onClick={closeBottomSheet}
          />
          {isDirectionsSheetOpen ? (
            <div
              key={`directions-${selectedPlace.id}`}
              className={cn("mapTapSheet", { mapTapSheetClosing: isSheetClosing })}
              role="dialog"
              aria-modal="true"
              aria-labelledby="toiletDirectionsTitle"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={cn("mapTapSheetGrabber")} aria-hidden="true" />
              <h2 id="toiletDirectionsTitle" className={cn("mapTapSheetAddress")}>
                {selectedPlace.address}
              </h2>
              {selectedPlaceDistanceLabel && (
                <p className={cn("mapTapSheetDistance")}>{selectedPlaceDistanceLabel}</p>
              )}
              <div className={cn("mapTapSheetDivider")} aria-hidden="true" />
              <div className={cn("mapTapSheetActions")}>
                <div className={cn("mapTapSheetIconGroup")}>
                  <button
                    type="button"
                    className={cn("mapTapSheetIconButton")}
                    aria-label="위치 공유"
                    onClick={() => void shareToiletPlace(selectedPlace)}
                  >
                    <Image src={shareIcon} alt="" width={24} height={24} />
                  </button>
                </div>
                <div className={cn("mapTapSheetNavGroup")}>
                  <button
                    type="button"
                    className={cn("mapTapSheetNavButton", "mapTapSheetNavButtonDepart")}
                    onClick={() => openKakaoMapLink("from", selectedPlace)}
                  >
                    출발
                  </button>
                  <button
                    type="button"
                    className={cn("mapTapSheetNavButton", "mapTapSheetNavButtonArrive")}
                    onClick={() => openKakaoMapLink("to", selectedPlace)}
                  >
                    도착
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={`detail-${selectedPlace.id}`}
              className={cn("bottomSheet", { bottomSheetClosing: isSheetClosing })}
              role="dialog"
              aria-modal="true"
              aria-labelledby="toiletSheetTitle"
              onClick={(e) => e.stopPropagation()}
            >
              <span id="toiletSheetTitle" className={cn("bottomSheetSrTitle")}>
                {selectedPlace.name}
              </span>
              <div className={cn("bottomSheetTopRow")}>
                <div className={cn("bottomSheetTextCol")}>
                  <span
                    className={cn("bottomSheetBadge")}
                    style={{ backgroundColor: getCategoryBadgeBackground(selectedPlace.categoryLabel) }}
                  >
                    {selectedPlace.categoryLabel}
                  </span>
                  <p className={cn("bottomSheetName")}>{selectedPlace.name}</p>
                  <p className={cn("bottomSheetHours")}>{selectedPlace.openingHours}</p>
                </div>
                {(selectedPlace.hasCctv || selectedPlace.hasDiaperTable) && (
                  <div className={cn("bottomSheetIconGroup")}>
                    {selectedPlace.hasCctv && (
                      <Image
                        src={cctvIcon}
                        alt="CCTV 있음"
                        width={BADGE_ICON_SIZE}
                        height={BADGE_ICON_SIZE}
                      />
                    )}
                    {selectedPlace.hasDiaperTable && (
                      <Image
                        src={diaperChangingTableIcon}
                        alt="기저귀 교환대 있음"
                        width={BADGE_ICON_SIZE}
                        height={BADGE_ICON_SIZE}
                      />
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={cn("bottomSheetDirections")}
                onClick={() => setIsDirectionsSheetOpen(true)}
              >
                길찾기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
