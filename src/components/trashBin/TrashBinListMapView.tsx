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

const cn = classNames.bind(styles);

const PIN_SIZE = { width: 35, height: 53 };
const PIN_ANCHOR = { x: 17, y: 53 };

const MY_LOC_SIZE = { width: 24, height: 24 };
const MY_LOC_ANCHOR = { x: 12, y: 12 };

const FALLBACK_BIN_IMAGE_URL = "/mapIconGray.svg";

/** 달성군청(논공읍 청사) — 지도 최초 중심 및 위치 권한은 있으나 신호 불가 등 시 거리 참조 폴백 */
const DALSEONG_COUNTY_OFFICE = { lat: 35.77448, lng: 128.43018 };

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

function openKakaoDirections(place: TrashBinPlace) {
  const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

type MapTapInfo = {
  lat: number;
  lng: number;
  addressLabel: string;
};

function distanceInMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusM = 6371000;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusM * c;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function TrashBinListMapView() {
  const router = useRouter();

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMaps.Map | null>(null);
  const markersRef = useRef<KakaoMaps.Marker[]>([]);
  const userLocationMarkerRef = useRef<KakaoMaps.Marker | null>(null);
  const mapTapMarkerRef = useRef<KakaoMaps.Marker | null>(null);
  const isMapDraggingRef = useRef(false);
  const ignoreMapClickUntilRef = useRef(0);
  /** 마커 클릭 직후 지도 click으로 바텀시트가 바로 닫히지 않게 함 */
  const blockMapDeselectRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<TrashBinPlace | null>(null);
  const [selectedMapTap, setSelectedMapTap] = useState<MapTapInfo | null>(null);
  /** 실제 GPS 또는 거부·오류 시 달성군청 좌표 (거리·내 위치 마커 기준) */
  const [referenceLocation, setReferenceLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isMapTapResolving, setIsMapTapResolving] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  /** 위치 권한 허용(또는 거부 외 오류 폴백) 전에는 지도·마커를 올리지 않음 — 재방문 시 effect가 다시 돌며 getCurrentPosition으로 다시 요청 */
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
    if (!selectedPlace) setIsImagePreviewOpen(false);
  }, [selectedPlace]);

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

    const finishOk = (lat: number, lng: number) => {
      if (cancelled) return;
      console.log("[GEO SUCCESS] current position:", { lat, lng });
      setReferenceLocation({ lat, lng });
      setGeoGateOk(true);
    };

    const finishFallback = () => {
      if (cancelled) return;
      console.warn("[GEO FALLBACK] using DALSEONG_COUNTY_OFFICE");
      setReferenceLocation({ ...DALSEONG_COUNTY_OFFICE });
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
      (pos) => finishOk(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        if (cancelled) return;
        console.error("[GEO ERROR]", { code: err.code, message: err.message });
        if (err.code === err.PERMISSION_DENIED) {
          alert("근처 수거함 안내를 위해 위치 권한이 필요해요. 홈 화면으로 이동합니다.");
          goHome();
          return;
        }
        finishFallback();
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
    );

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!trashBinsQuery.data) return;
    setTrashBins(trashBinsQuery.data);
  }, [setTrashBins, trashBinsQuery.data]);

  /** 카카오 지도 초기화 — 위치 허용(또는 비거부 폴백) 확정 후에만 실행해, 거부 직후 짧게 지도가 깜박이지 않도록 함 */
  useEffect(() => {
    if (!geoGateOk) return;

    const el = mapElRef.current;
    if (!el) return;

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
      const geocoder = new maps.services.Geocoder();
      if (!referenceLocation) return;
      console.log("[MAP INIT] center from referenceLocation:", referenceLocation);
      const center = new maps.LatLng(referenceLocation.lat, referenceLocation.lng);
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

      maps.event.addListener(map, "click", (mouseEvent: { latLng: KakaoMaps.LatLng }) => {
        if (isMapDraggingRef.current || Date.now() < ignoreMapClickUntilRef.current) {
          return;
        }
        if (blockMapDeselectRef.current) return;
        setSelectedPlace(null);
        setIsImagePreviewOpen(false);

        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        mapTapMarkerRef.current?.setMap(null);
        mapTapMarkerRef.current = new maps.Marker({
          map,
          position: new maps.LatLng(lat, lng),
        });
        setIsMapTapResolving(true);
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (cancelled || !mapInstanceRef.current || map !== mapInstanceRef.current) return;
          const isOk = status === maps.services.Status.OK;
          const item = isOk ? result?.[0] : undefined;
          const road = item?.road_address?.address_name?.trim() ?? "";
          const jibun = item?.address?.address_name?.trim() ?? "";
          const label = road || jibun || "선택한 위치";
          setSelectedMapTap({ lat, lng, addressLabel: label });
          setIsMapTapResolving(false);
        });
      });

      if (!cancelled) {
        setMapReady(true);
      }
      requestAnimationFrame(() => map.relayout());
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      userLocationMarkerRef.current?.setMap(null);
      userLocationMarkerRef.current = null;
      mapTapMarkerRef.current?.setMap(null);
      mapTapMarkerRef.current = null;
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [geoGateOk, referenceLocation]);

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
        setSelectedPlace(place);
        setSelectedMapTap(null);
        mapTapMarkerRef.current?.setMap(null);
        mapTapMarkerRef.current = null;
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

  /** 기준 위치(실제 GPS 또는 달성군청) 마커 */
  useEffect(() => {
    if (!mapReady || !referenceLocation || !mapInstanceRef.current || !window.kakao?.maps) {
      return;
    }
    const map = mapInstanceRef.current;
    const { maps } = window.kakao;
    const myLocIconSrc = `${window.location.origin}/myLocationDot.svg`;

    userLocationMarkerRef.current?.setMap(null);
    const dotImage = new maps.MarkerImage(
      myLocIconSrc,
      new maps.Size(MY_LOC_SIZE.width, MY_LOC_SIZE.height),
      { offset: new maps.Point(MY_LOC_ANCHOR.x, MY_LOC_ANCHOR.y) }
    );
    userLocationMarkerRef.current = new maps.Marker({
      map,
      position: new maps.LatLng(referenceLocation.lat, referenceLocation.lng),
      image: dotImage,
    });
  }, [mapReady, referenceLocation]);

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

      {geoGateOk && (selectedPlace || isMapTapResolving || selectedMapTap) && (
        <>
          <button
            type="button"
            className={cn("bottomSheetBackdrop")}
            aria-label="상세 닫기"
            onClick={() => {
              setSelectedPlace(null);
              setSelectedMapTap(null);
              setIsMapTapResolving(false);
              mapTapMarkerRef.current?.setMap(null);
              mapTapMarkerRef.current = null;
            }}
          />
          {selectedPlace && (
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
                onClick={() => openKakaoDirections(selectedPlace)}
              >
                길찾기
              </button>
            </div>
          )}

          {!selectedPlace && (
            <div
              className={cn("mapTapSheet")}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mapTapSheetTitle"
              onClick={(e) => e.stopPropagation()}
            >
              {isMapTapResolving && <p className={cn("mapTapSheetAddress")}>주소를 불러오는 중...</p>}
              {!isMapTapResolving && selectedMapTap && (
                <>
                  <p className={cn("mapTapSheetAddress")}>{selectedMapTap.addressLabel}</p>
                  <p className={cn("mapTapSheetDistance")}>
                    {referenceLocation
                      ? `현재 위치에서 ${formatDistance(
                          distanceInMeters(referenceLocation, {
                            lat: selectedMapTap.lat,
                            lng: selectedMapTap.lng,
                          })
                        )}`
                      : "현재 위치를 확인하는 중이에요."}
                  </p>
                  <button
                    type="button"
                    className={cn("bottomSheetDirections")}
                    onClick={() =>
                      openKakaoDirections({
                        id: "selected-map-tap",
                        lat: selectedMapTap.lat,
                        lng: selectedMapTap.lng,
                        name: selectedMapTap.addressLabel,
                        categoryLabel: "선택 위치",
                        description: selectedMapTap.addressLabel,
                        imageUrl: FALLBACK_BIN_IMAGE_URL,
                      })
                    }
                  >
                    이 위치로 길찾기
                  </button>
                </>
              )}
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
