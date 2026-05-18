import { useEffect, useMemo, useRef, useState } from "react";
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

const USER_LOC_OVERLAY_SIZE = 48;

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

function headingFromGeolocation(coords: GeolocationCoordinates): number | null {
  const { heading } = coords;
  if (heading == null || Number.isNaN(heading) || heading < 0) return null;
  return heading;
}

function headingFromDeviceOrientation(event: DeviceOrientationEvent): number | null {
  const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
    .webkitCompassHeading;
  if (typeof webkitHeading === "number" && !Number.isNaN(webkitHeading)) {
    return webkitHeading;
  }
  if (event.alpha == null || Number.isNaN(event.alpha)) return null;
  return (360 - event.alpha) % 360;
}

function createUserLocationOverlayElement(): {
  root: HTMLDivElement;
  setHeading: (heading: number | null) => void;
} {
  const root = document.createElement("div");
  root.style.cssText = [
    "position:relative",
    `width:${USER_LOC_OVERLAY_SIZE}px`,
    `height:${USER_LOC_OVERLAY_SIZE}px`,
    "pointer-events:none",
  ].join(";");

  const headingLayer = document.createElement("div");
  headingLayer.style.cssText = [
    "position:absolute",
    "inset:0",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "transform-origin:50% 50%",
  ].join(";");

  const arrow = document.createElement("div");
  arrow.style.cssText = [
    "position:absolute",
    "top:2px",
    "left:50%",
    "transform:translateX(-50%)",
    "width:0",
    "height:0",
    "border-left:7px solid transparent",
    "border-right:7px solid transparent",
    "border-bottom:14px solid rgba(25,139,230,0.55)",
  ].join(";");

  const dot = document.createElement("img");
  dot.src = `${window.location.origin}/myLocationDot.svg`;
  dot.width = 24;
  dot.height = 24;
  dot.alt = "";
  dot.style.cssText =
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;";

  headingLayer.appendChild(arrow);
  root.appendChild(headingLayer);
  root.appendChild(dot);

  return {
    root,
    setHeading: (heading) => {
      if (heading == null) {
        headingLayer.style.display = "none";
        return;
      }
      headingLayer.style.display = "flex";
      headingLayer.style.transform = `rotate(${heading}deg)`;
    },
  };
}

export default function TrashBinListMapView() {
  const router = useRouter();

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMaps.Map | null>(null);
  const markersRef = useRef<KakaoMaps.Marker[]>([]);
  const userLocationOverlayRef = useRef<KakaoMaps.CustomOverlay | null>(null);
  const userLocationOverlayElRef = useRef<ReturnType<typeof createUserLocationOverlayElement> | null>(
    null
  );
  const isMapDraggingRef = useRef(false);
  const ignoreMapClickUntilRef = useRef(0);
  /** 마커 클릭 직후 지도 click으로 바텀시트가 바로 닫히지 않게 함 */
  const blockMapDeselectRef = useRef(false);
  const hasGpsHeadingRef = useRef(false);
  const didInitMapRef = useRef(false);
  /** 지도 최초 중심 — GPS 갱신마다 지도를 재생성하지 않도록 1회만 고정 */
  const mapInitCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<TrashBinPlace | null>(null);
  const [isDirectionsSheetOpen, setIsDirectionsSheetOpen] = useState(false);
  /** 실제 GPS 좌표 (위치 거부/오류 시 홈으로 이동) */
  const [referenceLocation, setReferenceLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  /** 위치 권한 허용 전에는 지도·마커를 올리지 않음 — 재방문 시 effect가 다시 돌며 getCurrentPosition으로 다시 요청 */
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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const binsError = trashBinsQuery.isError
    ? "수거함 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
    : null;
  const places = useMemo(() => trashBins.map(trashBinApiToPlace), [trashBins]);

  useEffect(() => {
    if (!selectedPlace) {
      setIsImagePreviewOpen(false);
      setIsDirectionsSheetOpen(false);
    }
  }, [selectedPlace]);

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

  /** 매 페이지 진입마다 브라우저 위치 권한 재요청. 사용자가 명시 거부하면 홈으로 이동 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const goHome = () => {
      void router.replace("/");
    };

    const finishOk = (lat: number, lng: number, heading: number | null) => {
      if (cancelled) return;
      setReferenceLocation({ lat, lng });
      if (heading != null) setUserHeading(heading);
      setGeoGateOk(true);
    };

    if (!navigator.geolocation) {
      alert(
        "이 기기에서는 위치 정보를 사용할 수 없어요. 근처 수거함 기능은 위치 허용이 필요합니다."
      );
      goHome();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        finishOk(
          pos.coords.latitude,
          pos.coords.longitude,
          headingFromGeolocation(pos.coords)
        ),
      (err) => {
        if (cancelled) return;
        alert("근처 수거함 안내를 위해 위치 권한이 필요해요. 홈 화면으로 이동합니다.");
        goHome();
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
    );

    return () => {
      cancelled = true;
    };
  }, [router]);

  /** 이동 시 위치·방향 갱신 및 지도 중심 동기화 */
  useEffect(() => {
    if (!geoGateOk || typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setReferenceLocation({ lat, lng });
        const heading = headingFromGeolocation(pos.coords);
        if (heading != null) {
          hasGpsHeadingRef.current = true;
          setUserHeading(heading);
        }

      },
      () => {
        /* 위치 추적 일시 오류는 무시 — 마지막 좌표 유지 */
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15_000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [geoGateOk]);

  /** GPS heading이 없을 때 기기 나침반(방향) 보조 */
  useEffect(() => {
    if (!geoGateOk || typeof window === "undefined") return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (hasGpsHeadingRef.current) return;
      const heading = headingFromDeviceOrientation(event);
      if (heading != null) setUserHeading(heading);
    };

    const attach = () => {
      window.addEventListener("deviceorientation", onOrientation, true);
    };

    type DeviceOrientationPermission = "granted" | "denied" | "default";

    const request: Promise<DeviceOrientationPermission> =
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission === "function"
        ? (DeviceOrientationEvent.requestPermission() as Promise<DeviceOrientationPermission>)
        : Promise.resolve("granted");

    let cancelled = false;
    void request.then((state: DeviceOrientationPermission) => {
      if (cancelled || state !== "granted") return;
      attach();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [geoGateOk]);

  useEffect(() => {
    if (!trashBinsQuery.data) return;
    setTrashBins(trashBinsQuery.data);
  }, [setTrashBins, trashBinsQuery.data]);

  useEffect(() => {
    if (!referenceLocation) return;
    mapInitCenterRef.current ??= {
      lat: referenceLocation.lat,
      lng: referenceLocation.lng,
    };
  }, [referenceLocation]);

  /** 카카오 지도 초기화 — 위치 허용 확정 후 1회만 (GPS 갱신 시 재생성하지 않음) */
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
        setSelectedPlace(null);
        setIsImagePreviewOpen(false);
        setIsDirectionsSheetOpen(false);
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
      userLocationOverlayRef.current?.setMap(null);
      userLocationOverlayRef.current = null;
      userLocationOverlayElRef.current = null;
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
  }, [mapReady, places]);

  /** 기준 위치(실제 GPS) — 방향 화살표 + 점 */
  useEffect(() => {
    if (!mapReady || !referenceLocation || !mapInstanceRef.current || !window.kakao?.maps) {
      return;
    }
    const map = mapInstanceRef.current;
    const { maps } = window.kakao;
    const position = new maps.LatLng(referenceLocation.lat, referenceLocation.lng);

    if (!userLocationOverlayElRef.current) {
      userLocationOverlayElRef.current = createUserLocationOverlayElement();
    }
    userLocationOverlayElRef.current.setHeading(userHeading);

    if (!userLocationOverlayRef.current) {
      userLocationOverlayRef.current = new maps.CustomOverlay({
        map,
        position,
        content: userLocationOverlayElRef.current.root,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 4,
      });
    } else {
      userLocationOverlayRef.current.setPosition(position);
      userLocationOverlayRef.current.setMap(map);
    }
  }, [mapReady, referenceLocation, userHeading]);

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

      {geoGateOk && selectedPlace && (
        <>
          <button
            type="button"
            className={cn("bottomSheetBackdrop", {
              bottomSheetBackdropDirections: isDirectionsSheetOpen,
            })}
            aria-label="상세 닫기"
            onClick={() => {
              setSelectedPlace(null);
              setIsDirectionsSheetOpen(false);
            }}
          />
          {isDirectionsSheetOpen ? (
            <div
              className={cn("mapTapSheet")}
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
              className={cn("bottomSheet")}
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
