/**
 * 카카오 지도 JavaScript API — https://apis.map.kakao.com/web/guide/
 * 사용하는 메서드만 최소 선언합니다.
 */
export {};

declare global {
  namespace KakaoMaps {
    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(
        container: HTMLElement,
        options: { center: LatLng; level: number }
      );
      setCenter(latlng: LatLng): void;
      relayout(): void;
    }

    class Marker {
      constructor(options: { position: LatLng; map?: Map });
      setMap(map: Map | null): void;
    }
  }

  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        Map: typeof KakaoMaps.Map;
        LatLng: typeof KakaoMaps.LatLng;
        Marker: typeof KakaoMaps.Marker;
      };
    };
  }
}
