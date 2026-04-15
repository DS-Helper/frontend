/**
 * 카카오 지도 JavaScript API — https://apis.map.kakao.com/web/guide/
 * 사용하는 메서드만 최소 선언합니다.
 */
export {};

declare global {
  namespace KakaoMaps {
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class MarkerImage {
      constructor(
        src: string,
        size: Size,
        options?: { offset?: Point }
      );
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
      constructor(options: {
        position: LatLng;
        map?: Map;
        image?: MarkerImage;
      });
      setMap(map: Map | null): void;
    }

    namespace services {
      class Geocoder {
        coord2Address(
          lng: number,
          lat: number,
          callback: (
            result: Array<{
              address?: { address_name?: string };
              road_address?: { address_name?: string };
            }>,
            status: string
          ) => void
        ): void;
      }

      const Status: {
        OK: string;
      };
    }
  }

  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        Map: typeof KakaoMaps.Map;
        LatLng: typeof KakaoMaps.LatLng;
        Marker: typeof KakaoMaps.Marker;
        MarkerImage: typeof KakaoMaps.MarkerImage;
        Size: typeof KakaoMaps.Size;
        Point: typeof KakaoMaps.Point;
        event: {
          addListener: (
            target: KakaoMaps.Map | KakaoMaps.Marker,
            type: string,
            handler: (...args: any[]) => void
          ) => void;
        };
        services: typeof KakaoMaps.services;
      };
    };
  }
}
