import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/TrashBinList.module.scss";
import { getKakaoMapJavaScriptKeyForHost } from "@/lib/maps/kakaoMapEnv";
import { getKakaoMapLoadErrorMessage, loadKakaoMapSdk } from "@/lib/maps/loadKakaoMapSdk";
import type { TrashBinApiItem, TrashBinPlace } from "@/types/trashBin";
import { getTrashBins } from "@/lib/apis/trashBin";
import { useTrashBinStore } from "@/lib/store/trashBinStore";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import shareIcon from "@/public/shareIcon.svg";
import bookmarkIcon from "@/public/boardBookmarkIcon.svg";

const cn = classNames.bind(styles);

const PIN_SIZE = { width: 35, height: 53 };
const PIN_ANCHOR = { x: 17, y: 53 };

const FALLBACK_BIN_IMAGE_URL = "/mapIconGray.svg";

/** 바텀시트 열림/닫힘 애니메이션 (ms) — SCSS duration과 맞춤 */
const SHEET_ANIM_MS = 340;
const SHEET_BACKDROP_ANIM_MS = 280;
const SHEET_CLOSE_MS = Math.max(SHEET_ANIM_MS, SHEET_BACKDROP_ANIM_MS);

/** 위치 안내 confirm — 최초 1회만 */
const GEO_CONSENT_STORAGE_KEY = "factory.trashBin.geoConsentAsked";

function trashBinApiToPlace(item: TrashBinApiItem): TrashBinPlace {
  const imageUrl =
    typeof item.photoUrl === "string" && item.photoUrl.trim() !== ""
      ? item.photoUrl
      : FALLBACK_BIN_IMAGE_URL;
  const nameParts = [item.provinceName, item.cityCountyName, item.address]
    .map((s) => s.trim())
    .filter(Boolean);
  /** 바텀시트 본문은 API `locationDescription`만 노출 */
  const description = item.locationDescription.trim();

  return {
    id: item.id,
    lat: item.latitude,
    lng: item.longitude,
    name: nameParts.join(" ").trim() || item.address.trim() || "분리수거함",
    categoryLabel: item.binType.trim() || "분리수거함",
    description,
    imageUrl,
  };
}

function openKakaoMapLink(path: "to" | "from", place: TrashBinPlace) {
  const url = `https://map.kakao.com/link/${path}/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
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

async function shareTrashBinPlace(place: TrashBinPlace) {
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

export default function TrashBinListMapView() {
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

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<TrashBinPlace | null>(null);
  const [isDirectionsSheetOpen, setIsDirectionsSheetOpen] = useState(false);
  const [isSheetClosing, setIsSheetClosing] = useState(false);
  const sheetCloseTimerRef = useRef<number | null>(null);
  /** 페이지 진입 시 1회만 확보한 기준 좌표 (거리 표시·지도 중심) */
  const [referenceLocation, setReferenceLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  /** 위치 권한 허용 후에만 지도·API 조회 */
  const [geoGateOk, setGeoGateOk] = useState(false);
  const trashBins = useTrashBinStore((state) => state.trashBins);
  const setTrashBins = useTrashBinStore((state) => state.setTrashBins);

  const trashBinsQuery = useQuery({
    queryKey: ["trashBins", 0, 100],
    queryFn: async () => {
      const items = await getTrashBins();
      if (items == null) {
        throw new Error("TRASH_BINS_FETCH_FAILED");
      }
      return items;
    },
    enabled: geoGateOk,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const binsError = trashBinsQuery.isError
    ? "수거함 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
    : null;
  const places = useMemo(() => trashBins.map(trashBinApiToPlace), [trashBins]);

  const clearSheetCloseTimer = useCallback(() => {
    if (sheetCloseTimerRef.current != null) {
      window.clearTimeout(sheetCloseTimerRef.current);
      sheetCloseTimerRef.current = null;
    }
  }, []);

  const closeBottomSheet = useCallback(() => {
    if (!selectedPlace || isSheetClosing) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const closeMs = reducedMotion ? 0 : SHEET_CLOSE_MS;

    setIsSheetClosing(true);
    clearSheetCloseTimer();
    sheetCloseTimerRef.current = window.setTimeout(() => {
      setSelectedPlace(null);
      setIsDirectionsSheetOpen(false);
      setIsSheetClosing(false);
      sheetCloseTimerRef.current = null;
    }, closeMs);
  }, [clearSheetCloseTimer, isSheetClosing, selectedPlace]);

  const closeBottomSheetRef = useRef(closeBottomSheet);
  closeBottomSheetRef.current = closeBottomSheet;

  useEffect(() => {
    return () => clearSheetCloseTimer();
  }, [clearSheetCloseTimer]);

  useEffect(() => {
    if (!selectedPlace) {
      setIsImagePreviewOpen(false);
      if (!isSheetClosing) {
        setIsDirectionsSheetOpen(false);
      }
    }
  }, [isSheetClosing, selectedPlace]);

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

  useEffect(() => {
    if (!isImagePreviewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImagePreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isImagePreviewOpen]);

  /**
   * 진입 시 위치 권한 1회 요청 → 허용 시 현재 위치 1회만 확보 → 지도·API 로드.
   * watchPosition·내 위치 마커·연속 API 재요청 없음.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const goHome = () => {
      void router.replace("/");
    };

    const finishOk = (lat: number, lng: number) => {
      if (cancelled) return;
      const point = { lat, lng };
      mapInitCenterRef.current = point;
      setReferenceLocation(point);
      setGeoGateOk(true);
    };

    const requestPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => finishOk(pos.coords.latitude, pos.coords.longitude),
        () => {
          if (cancelled) return;
          alert("근처 수거함 안내를 위해 위치 권한이 필요해요. 홈 화면으로 이동합니다.");
          goHome();
        },
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
      );
    };

    void (async () => {
      if (!navigator.geolocation) {
        alert(
          "이 기기에서는 위치 정보를 사용할 수 없어요. 근처 수거함 기능은 위치 허용이 필요합니다."
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
          requestPosition();
          return;
        }
      } catch {
        /* Permissions API 미지원 브라우저 — 아래 confirm 후 getCurrentPosition */
      }

      const hasAskedBefore = window.localStorage.getItem(GEO_CONSENT_STORAGE_KEY) === "1";
      if (!hasAskedBefore) {
        const accepted = window.confirm(
          "근처 수거함을 지도에 표시하려면 현재 위치 접근이 필요해요. 위치를 허용할까요?"
        );
        window.localStorage.setItem(GEO_CONSENT_STORAGE_KEY, "1");
        if (!accepted) {
          goHome();
          return;
        }
      }

      requestPosition();
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!trashBinsQuery.data) return;
    setTrashBins(trashBinsQuery.data);
  }, [setTrashBins, trashBinsQuery.data]);

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
        setIsImagePreviewOpen(false);
        closeBottomSheetRef.current();
      });

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

  /** 수거함 마커 동기화 */
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.kakao?.maps) return;
    const map = mapInstanceRef.current;
    const { maps } = window.kakao;
    const pinIconSrc = `${window.location.origin}/pinIcon.svg`;
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
        setSelectedPlace(place);
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

  const isLoadingBins = geoGateOk && trashBinsQuery.isLoading && places.length === 0;

  return (
    <div className={cn("mapShell")}>
      {(mapError || binsError) && (
        <p className={cn("mapErrorBanner")} role="alert">
          {mapError ?? binsError}
        </p>
      )}

      {!geoGateOk && (
        <div className={cn("geoCheckingPanel")} aria-live="polite">
          <p className={cn("geoCheckingMessage")}>위치 권한 확인 중입니다…</p>
        </div>
      )}

      {geoGateOk && (
        <div ref={mapElRef} className={cn("mapContainer")} aria-label="휴지통 지도" />
      )}

      {isLoadingBins && (
        <div className={cn("geoCheckingPanel")} aria-live="polite">
          <p className={cn("geoCheckingMessage")}>수거함 정보를 불러오는 중입니다…</p>
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
              aria-labelledby="trashBinDirectionsTitle"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={cn("mapTapSheetGrabber")} aria-hidden="true" />
              <h2 id="trashBinDirectionsTitle" className={cn("mapTapSheetAddress")}>
                {selectedPlace.name}
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
                    aria-label="즐겨찾기"
                  >
                    <Image src={bookmarkIcon} alt="" width={24} height={24} />
                  </button>
                  <button
                    type="button"
                    className={cn("mapTapSheetIconButton")}
                    aria-label="위치 공유"
                    onClick={() => void shareTrashBinPlace(selectedPlace)}
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
              aria-labelledby="trashBinSheetTitle"
              onClick={(e) => e.stopPropagation()}
            >
              <span id="trashBinSheetTitle" className={cn("bottomSheetSrTitle")}>
                {selectedPlace.name}
              </span>
              <div className={cn("bottomSheetTopRow")}>
                <button
                  type="button"
                  className={cn("bottomSheetThumbWrap")}
                  aria-label="휴지통 사진 크게 보기"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImagePreviewOpen(true);
                  }}
                >
                  <Image
                    src={selectedPlace.imageUrl}
                    alt=""
                    className={cn("bottomSheetThumb")}
                    width={90}
                    height={90}
                    loading="lazy"
                    decoding="async"
                    unoptimized
                  />
                </button>
                <div className={cn("bottomSheetTextCol")}>
                  <span className={cn("bottomSheetBadge")}>{selectedPlace.categoryLabel}</span>
                  <p className={cn("bottomSheetDescription")}>{selectedPlace.description}</p>
                </div>
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

      {geoGateOk && isImagePreviewOpen && selectedPlace && (
        <div className={cn("imagePreviewRoot")} role="presentation">
          <button
            type="button"
            className={cn("imagePreviewBackdrop")}
            aria-label="사진 닫기"
            onClick={() => setIsImagePreviewOpen(false)}
          />
          <div
            className={cn("imagePreviewFrame")}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPlace.name} 사진`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn("imagePreviewImageWrap")}>
              <Image
                src={selectedPlace.imageUrl}
                alt=""
                width={1200}
                height={900}
                className={cn("imagePreviewImage")}
                sizes="(max-width: 900px) calc(100vw - 3.2rem), 52rem"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
