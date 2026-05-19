/** GET /trash-bins 응답 `data.trashBins[]` 원본 항목 */
export type TrashBinApiItem = {
  id: string;
  provinceName: string;
  cityCountyName: string;
  address: string;
  photoUrl: string | null;
  locationDescription: string;
  installationPoint: string;
  binType: string;
  managementAgencyName: string;
  managementAgencyPhoneNumber: string;
  latitude: number;
  longitude: number;
  dataReferenceDate: string;
  existsYn: string | null;
};

/** 카카오 지도 마커 / 바텀시트 표시용 (API → UI 매핑) */
export type TrashBinPlace = {
  id: string;
  lat: number;
  lng: number;
  /** 길찾기 링크용 표시 이름 */
  name: string;
  categoryLabel: string;
  /** 바텀시트 본문 — `TrashBinApiItem.locationDescription`만 사용 */
  description: string;
  imageUrl: string;
};
