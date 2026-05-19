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

const USER_LOC_OVERLAY_SIZE = 48;
/** GPS 점프 시 즉시 이동 (m) — 이보다 작으면 보간 */
const USER_LOC_SNAP_DISTANCE_M = 80;
/** 내 위치 마커 이동 보간 시간 (ms) */
const USER_LOC_ANIM_MS = 380;

type GeoPoint = { lat: number; lng: number };

function lerpCoord(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

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


function bearingFromMovement(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number | null {
  const movedM = distanceMeters(from.lat, from.lng, to.lat, to.lng);
  if (movedM < 1.5) return null;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function resolveUserHeading(
  gpsHeading: number | null,
  previous: { lat: number; lng: number } | null,
  current: { lat: number; lng: number },
  lastKnownHeading: number | null
): number | null {
  if (gpsHeading != null) return gpsHeading;
  if (previous) {
    const movementHeading = bearingFromMovement(previous, current);
    if (movementHeading != null) return movementHeading;
  }
  return lastKnownHeading;
}

function createUserLocationOverlayElement(): {
  root: HTMLDivElement;
  setHeading: (heading: number | null) => void;
} {
  let cachedHeading: number | null = null;

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
    "display:flex",
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
      if (heading != null) {
        cachedHeading = heading;
      }
      const degrees = cachedHeading ?? 0;
      headingLayer.style.display = "flex";
      headingLayer.style.transform = `rotate(${degrees}deg)`;
      headingLayer.style.opacity = cachedHeading != null ? "1" : "0.5";
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
  const didInitMapRef = useRef(false);
  const lastGeoPointRef = useRef<GeoPoint | null>(null);
  const lastHeadingRef = useRef<number | null>(null);
  const displayedGeoRef = useRef<GeoPoint | null>(null);
  const userLocAnimFrameRef = useRef<number | null>(null);
  const userLocAnimFromRef = useRef<GeoPoint | null>(null);
  const userLocAnimToRef = useRef<GeoPoint | null>(null);
  const userLocAnimStartRef = useRef(0);
  const orientationListenerAttachedRef = useRef(false);
  /** 지도를 드래그하면 내 위치 따라가기 해제 */
  const followUserLocationRef = useRef(true);
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
  const [isFollowingUser, setIsFollowingUser] = useState(true);

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

  const panMapToUser = useCallback((lat: number, lng: number, immediate = false) => {
    if (!followUserLocationRef.current) return;

    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    const { maps } = window.kakao;
    const latlng = new maps.LatLng(lat, lng);
    if (immediate) {
      map.setCenter(latlng);
      return;
    }
    map.panTo(latlng);
  }, []);

  const applyUserLocationOverlay = useCallback((lat: number, lng: number, heading: number | null) => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    const { maps } = window.kakao;
    if (!userLocationOverlayElRef.current) {
      userLocationOverlayElRef.current = createUserLocationOverlayElement();
    }

    const resolvedHeading = heading ?? lastHeadingRef.current;
    if (resolvedHeading != null) {
      lastHeadingRef.current = resolvedHeading;
    }
    userLocationOverlayElRef.current.setHeading(resolvedHeading);

    displayedGeoRef.current = { lat, lng };
    const position = new maps.LatLng(lat, lng);
    if (!userLocationOverlayRef.current) {
      userLocationOverlayRef.current = new maps.CustomOverlay({
        map,
        position,
        content: userLocationOverlayElRef.current.root,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 4,
      });
      return;
    }

    userLocationOverlayRef.current.setPosition(position);
    userLocationOverlayRef.current.setMap(map);
  }, []);

  const cancelUserLocationAnimation = useCallback(() => {
    if (userLocAnimFrameRef.current != null) {
      cancelAnimationFrame(userLocAnimFrameRef.current);
      userLocAnimFrameRef.current = null;
    }
  }, []);

  const animateUserLocationOverlay = useCallback(
    (target: GeoPoint, heading: number | null) => {
      const map = mapInstanceRef.current;
      if (!map || !window.kakao?.maps) return;

      const from = displayedGeoRef.current ?? target;
      const jumpM = distanceMeters(from.lat, from.lng, target.lat, target.lng);

      if (jumpM >= USER_LOC_SNAP_DISTANCE_M || jumpM < 0.5) {
        cancelUserLocationAnimation();
        panMapToUser(target.lat, target.lng, jumpM >= USER_LOC_SNAP_DISTANCE_M);
        applyUserLocationOverlay(target.lat, target.lng, heading);
        return;
      }

      panMapToUser(target.lat, target.lng, false);
      cancelUserLocationAnimation();
      userLocAnimFromRef.current = from;
      userLocAnimToRef.current = target;
      userLocAnimStartRef.current = performance.now();

      const step = (now: number) => {
        const rawT = Math.min(1, (now - userLocAnimStartRef.current) / USER_LOC_ANIM_MS);
        const t = easeOutCubic(rawT);
        const fromPt = userLocAnimFromRef.current;
        const toPt = userLocAnimToRef.current;
        if (!fromPt || !toPt) {
          userLocAnimFrameRef.current = null;
          return;
        }

        const lat = lerpCoord(fromPt.lat, toPt.lat, t);
        const lng = lerpCoord(fromPt.lng, toPt.lng, t);
        applyUserLocationOverlay(lat, lng, heading);

        if (rawT < 1) {
          userLocAnimFrameRef.current = requestAnimationFrame(step);
        } else {
          applyUserLocationOverlay(toPt.lat, toPt.lng, heading);
          userLocAnimFrameRef.current = null;
        }
      };

      userLocAnimFrameRef.current = requestAnimationFrame(step);
    },
    [applyUserLocationOverlay, cancelUserLocationAnimation, panMapToUser]
  );

  const recenterOnUser = useCallback(() => {
    const point = referenceLocation ?? displayedGeoRef.current ?? lastGeoPointRef.current;
    if (!point) return;

    followUserLocationRef.current = true;
    setIsFollowingUser(true);
    panMapToUser(point.lat, point.lng, false);
    animateUserLocationOverlay(point, userHeading ?? lastHeadingRef.current);
  }, [animateUserLocationOverlay, panMapToUser, referenceLocation, userHeading]);

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
      const point = { lat, lng };
      lastGeoPointRef.current = point;
      if (heading != null) {
        lastHeadingRef.current = heading;
        setUserHeading(heading);
      }
      setReferenceLocation(point);
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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const current = { lat, lng };
        const heading = resolveUserHeading(
          headingFromGeolocation(pos.coords),
          lastGeoPointRef.current,
          current,
          lastHeadingRef.current
        );

        lastGeoPointRef.current = current;
        if (heading != null) {
          lastHeadingRef.current = heading;
          setUserHeading(heading);
        }

        setReferenceLocation(current);
      },
      () => {
        /* 위치 추적 일시 오류는 무시 — 마지막 좌표 유지 */
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [geoGateOk]);

  /** GPS heading이 없을 때 기기 나침반(방향) 보조 */
  useEffect(() => {
    if (!geoGateOk || typeof window === "undefined") return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      const heading = headingFromDeviceOrientation(event);
      if (heading == null) return;

      lastHeadingRef.current = heading;
      setUserHeading(heading);

      const point = displayedGeoRef.current ?? lastGeoPointRef.current;
      if (point) {
        applyUserLocationOverlay(point.lat, point.lng, heading);
      }
    };

    const attachOrientationListener = () => {
      if (orientationListenerAttachedRef.current) return;
      orientationListenerAttachedRef.current = true;
      window.addEventListener("deviceorientation", onOrientation, true);
    };

    type DeviceOrientationPermission = "granted" | "denied" | "default";

    const requestOrientationPermission = () => {
      const request: Promise<DeviceOrientationPermission> =
        typeof DeviceOrientationEvent !== "undefined" &&
        "requestPermission" in DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === "function"
          ? (DeviceOrientationEvent.requestPermission() as Promise<DeviceOrientationPermission>)
          : Promise.resolve("granted");

      void request.then((state: DeviceOrientationPermission) => {
        if (state === "granted") attachOrientationListener();
      });
    };

    requestOrientationPermission();

    const mapEl = mapElRef.current;
    const onMapPointerDown = () => {
      requestOrientationPermission();
    };
    mapEl?.addEventListener("pointerdown", onMapPointerDown, { passive: true });

    return () => {
      mapEl?.removeEventListener("pointerdown", onMapPointerDown);
      window.removeEventListener("deviceorientation", onOrientation, true);
      orientationListenerAttachedRef.current = false;
    };
  }, [geoGateOk, applyUserLocationOverlay]);


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
        if (followUserLocationRef.current) {
          followUserLocationRef.current = false;
          setIsFollowingUser(false);
        }
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
      cancelUserLocationAnimation();
      didInitMapRef.current = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      userLocationOverlayRef.current?.setMap(null);
      userLocationOverlayRef.current = null;
      userLocationOverlayElRef.current = null;
      displayedGeoRef.current = null;
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [geoGateOk, cancelUserLocationAnimation]);

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
    if (!mapReady || !referenceLocation) return;
    animateUserLocationOverlay(
      referenceLocation,
      userHeading ?? lastHeadingRef.current
    );
  }, [mapReady, referenceLocation, userHeading, animateUserLocationOverlay]);


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

      {geoGateOk && mapReady && !isFollowingUser && (
        <button
          type="button"
          className={cn("mapFollowButton", {
            mapFollowButtonSheetOpen: Boolean(selectedPlace),
          })}
          aria-label="내 위치 따라가기"
          onClick={recenterOnUser}
        >
          <Image src="/myLocationDot.svg" alt="" width={24} height={24} />
        </button>
      )}

      {geoGateOk && selectedPlace && (
        <>
          <button
            type="button"
            className={cn("bottomSheetBackdrop")}
            aria-label="상세 닫기"
            onClick={() => {
              setSelectedPlace(null);
              setIsDirectionsSheetOpen(false);
            }}
          />
          {isDirectionsSheetOpen ? (
            <div
              key={`directions-${selectedPlace.id}`}
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
              key={`detail-${selectedPlace.id}`}
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
