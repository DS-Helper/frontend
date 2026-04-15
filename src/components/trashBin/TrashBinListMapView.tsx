import { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import styles from "../../styles/TrashBinList.module.scss";
import { getKakaoMapJavaScriptKeyForHost } from "@/lib/maps/kakaoMapEnv";
import { getKakaoMapLoadErrorMessage, loadKakaoMapSdk } from "@/lib/maps/loadKakaoMapSdk";
import type { TrashBinPlace } from "@/types/trashBin";
import Image from "next/image";

const cn = classNames.bind(styles);

const PIN_SIZE = { width: 35, height: 53 };
const PIN_ANCHOR = { x: 17, y: 53 };

const MY_LOC_SIZE = { width: 24, height: 24 };
const MY_LOC_ANCHOR = { x: 12, y: 12 };

/**
 * ?�성군청(?�공??�?��) ??지??**최초 중심**�??�기�?고정.
 * ?�용???�치???�용 ??`myLocationDot.svg` 마커로만 별도 ?�시?�니??
 */
const DALSEONG_COUNTY_OFFICE = { lat: 35.77448, lng: 128.43018 };

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

/** 백엔???�동 ??�??�이??*/
const MOCK_TRASH_BINS: TrashBinPlace[] = [
  {
    id: "mock-1",
    lat: 35.7751,
    lng: 128.4302,
    name: "?�마?�공???�근 ?��???,
    categoryLabel: "?�반?�레기통",
    description: "?�마?�공???�측???�치???�어??",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&h=240&fit=crop&q=80",
  },
  {
    id: "mock-2",
    lat: 35.7736,
    lng: 128.4275,
    name: "?�성군청 주�? ?�거??,
    categoryLabel: "?�반?�레기통",
    description: "군청 민원 ?�선 쪽에 ?�치?�어 ?�어??",
    imageUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=240&h=240&fit=crop&q=80",
  },
  {
    id: "mock-3",
    lat: 35.7758,
    lng: 128.4268,
    name: "공원 ?�책�?분리?�거??,
    categoryLabel: "?�활??,
    description: "?�라?�틱·�?분리 배출??가?�해??",
    imageUrl:
      "https://images.unsplash.com/photo-1605600659908-0ef14b481dfd?w=240&h=240&fit=crop&q=80",
  },
  {
    id: "mock-4",
    lat: 35.7729,
    lng: 128.4315,
    name: "마을 ?�구 ?�???�거??,
    categoryLabel: "?�반?�레기통",
    description: "주차??근처???�게 찾을 ???�어??",
    imageUrl:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=240&h=240&fit=crop&q=80",
  },
];

export default function TrashBinListMapView() {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMaps.Map | null>(null);
  const markersRef = useRef<KakaoMaps.Marker[]>([]);
  const userLocationMarkerRef = useRef<KakaoMaps.Marker | null>(null);
  const mapTapMarkerRef = useRef<KakaoMaps.Marker | null>(null);
  const isMapDraggingRef = useRef(false);
  const ignoreMapClickUntilRef = useRef(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TrashBinPlace | null>(null);
  const [selectedMapTap, setSelectedMapTap] = useState<MapTapInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapTapResolving, setIsMapTapResolving] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

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

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    const appKey = getKakaoMapJavaScriptKeyForHost(window.location.hostname);
    if (!appKey) {
      setMapError(
        "지?��? ?�시?�려�?.env??NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY(카카??JavaScript ??�??�정??주세??"
      );
      return;
    }

    let cancelled = false;
    const pinIconSrc = `${window.location.origin}/pinIcon.svg`;
    const myLocIconSrc = `${window.location.origin}/myLocationDot.svg`;

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
      const center = new maps.LatLng(
        DALSEONG_COUNTY_OFFICE.lat,
        DALSEONG_COUNTY_OFFICE.lng
      );
      const map = new maps.Map(mapElRef.current, { center, level: 5 });
      mapInstanceRef.current = map;
      maps.event.addListener(map, "dragstart", () => {
        isMapDraggingRef.current = true;
        // ?�치/마우???�래�??�작 ??click 처리 ?�예
        ignoreMapClickUntilRef.current = Date.now() + 120;
      });
      maps.event.addListener(map, "dragend", () => {
        isMapDraggingRef.current = false;
        // ?�래�?종료 직후 발생?????�는 click??무시
        ignoreMapClickUntilRef.current = Date.now() + 220;
      });

      const markerSize = new maps.Size(PIN_SIZE.width, PIN_SIZE.height);
      const markerOffset = new maps.Point(PIN_ANCHOR.x, PIN_ANCHOR.y);
      const pinImage = new maps.MarkerImage(pinIconSrc, markerSize, {
        offset: markerOffset,
      });

      markersRef.current.forEach((m) => m.setMap(null));
      let blockMapDeselect = false;
      markersRef.current = MOCK_TRASH_BINS.map((place) => {
        const marker = new maps.Marker({
          map,
          position: new maps.LatLng(place.lat, place.lng),
          image: pinImage,
        });
        maps.event.addListener(marker, "click", () => {
          blockMapDeselect = true;
          setSelectedPlace(place);
          setSelectedMapTap(null);
          mapTapMarkerRef.current?.setMap(null);
          mapTapMarkerRef.current = null;
          window.setTimeout(() => {
            blockMapDeselect = false;
          }, 0);
        });
        return marker;
      });

      maps.event.addListener(map, "click", (mouseEvent: { latLng: KakaoMaps.LatLng }) => {
        if (isMapDraggingRef.current || Date.now() < ignoreMapClickUntilRef.current) {
          return;
        }
        if (blockMapDeselect) return;
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
          const label = road || jibun || "?�택???�치";
          setSelectedMapTap({ lat, lng, addressLabel: label });
          setIsMapTapResolving(false);
        });
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (
              cancelled ||
              !mapInstanceRef.current ||
              !window.kakao?.maps ||
              map !== mapInstanceRef.current
            ) {
              return;
            }
            userLocationMarkerRef.current?.setMap(null);
            const { maps: m } = window.kakao;
            const dotImage = new m.MarkerImage(
              myLocIconSrc,
              new m.Size(MY_LOC_SIZE.width, MY_LOC_SIZE.height),
              { offset: new m.Point(MY_LOC_ANCHOR.x, MY_LOC_ANCHOR.y) }
            );
            const userMarker = new m.Marker({
              map,
              position: new m.LatLng(pos.coords.latitude, pos.coords.longitude),
              image: dotImage,
            });
            userLocationMarkerRef.current = userMarker;
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            setCurrentLocation(null);
          },
          { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
        );
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
    };
  }, []);

  return (
    <div className={cn("mapShell")}>
      {mapError && (
        <p className={cn("mapErrorBanner")} role="alert">
          {mapError}
        </p>
      )}

      <div ref={mapElRef} className={cn("mapContainer")} aria-label="?��???지?? />

      {(selectedPlace || isMapTapResolving || selectedMapTap) && (
        <>
          <button
            type="button"
            className={cn("bottomSheetBackdrop")}
            aria-label="?�세 ?�기"
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
                  aria-label="?��????�진 ?�게 보기"
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
                길찾�?
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
              {isMapTapResolving && <p className={cn("mapTapSheetAddress")}>주소�?불러?�는 �?..</p>}
              {!isMapTapResolving && selectedMapTap && (
                <>
                  <p className={cn("mapTapSheetAddress")}>{selectedMapTap.addressLabel}</p>
                  <p className={cn("mapTapSheetDistance")}>
                    {currentLocation
                      ? `?�재 ?�치?�서 ${formatDistance(
                          distanceInMeters(currentLocation, {
                            lat: selectedMapTap.lat,
                            lng: selectedMapTap.lng,
                          })
                        )}`
                      : "?�재 ?�치�??�인?????�어 거리�?계산?��? 못했?�요."}
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
                        categoryLabel: "?�택 ?�치",
                        description: selectedMapTap.addressLabel,
                        imageUrl: "",
                      })
                    }
                  >
                    ???�치�?길찾�?
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {isImagePreviewOpen && selectedPlace && (
        <div className={cn("imagePreviewRoot")} role="presentation">
          <button
            type="button"
            className={cn("imagePreviewBackdrop")}
            aria-label="?�진 ?�기"
            onClick={() => setIsImagePreviewOpen(false)}
          />
          <div
            className={cn("imagePreviewFrame")}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPlace.name} ?�진`}
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
