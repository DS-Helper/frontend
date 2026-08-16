/** GET /public-toilets/nearby, GET /public-toilets/{id} 공통 원본 항목 */
export type PublicToiletApiItem = {
  id: string;
  localGovernmentCode: string;
  managementNumber: string;
  categoryName: string;
  legalBasisName: string;
  toiletName: string;
  roadAddress: string;
  parcelAddress: string;
  latitude: number;
  longitude: number;
  maleToiletCount: number;
  maleUrinalCount: number;
  maleDisabledToiletCount: number;
  maleDisabledUrinalCount: number;
  maleChildToiletCount: number;
  maleChildUrinalCount: number;
  femaleToiletCount: number;
  femaleDisabledToiletCount: number;
  femaleChildToiletCount: number;
  managementAgencyName: string;
  phoneNumber: string;
  openingHours: string;
  openingHoursDetail: string;
  installationYearMonth: string | null;
  ownershipTypeName: string;
  wasteTreatmentMethod: string;
  safetyFacilityTargetYn: string;
  emergencyBellYn: string;
  emergencyBellLocation: string | null;
  entranceCctvYn: string;
  diaperChangingTableYn: string;
  diaperChangingTableLocation: string | null;
  remodelingYearMonth: string | null;
  dataReferenceDate: string;
  dataUpdateType: string;
  dataUpdateTime: string;
  lastModifiedTime: string;
};

/** 카카오 지도 마커 / 바텀시트 표시용 (API → UI 매핑) */
export type ToiletPlace = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  categoryLabel: string;
  openingHours: string;
  /** 길찾기 시트 제목·카카오맵 길찾기 링크에 사용 — 도로명 주소(없으면 지번 주소) */
  address: string;
  hasCctv: boolean;
  hasDiaperTable: boolean;
};
