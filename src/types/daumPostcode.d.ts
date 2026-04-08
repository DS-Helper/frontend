/**
 * 다음(카카오) 우편번호 서비스 — https://postcode.map.daum.net/guide
 * 스크립트: //t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js
 */
export {};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcodeInstance;
    };
  }
}

/** embed 시 oncomplete로 전달되는 주요 필드만 정의 */
interface DaumPostcodeData {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  addressEnglish: string;
  addressType: "R" | "J";
  userSelectedType: "R" | "J";
  buildingName: string;
  apartment: "Y" | "N";
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: (state: "FORCE_CLOSE" | "COMPLETE_CLOSE") => void;
  onresize?: (size: { width: number; height: number }) => void;
  width?: string | number;
  height?: string | number;
  animation?: boolean;
  autoClose?: boolean;
}

interface DaumPostcodeInstance {
  embed: (element: HTMLElement | null, options?: { q?: string; autoClose?: boolean }) => void;
  open: () => void;
}
