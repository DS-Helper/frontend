/** 휴지통 지도 마커 / 상세 시트용 (백엔드 연동 시 동일 필드 매핑) */
export type TrashBinPlace = {
  id: string;
  lat: number;
  lng: number;
  /** 길찾기 링크용 표시 이름 */
  name: string;
  categoryLabel: string;
  description: string;
  imageUrl: string;
};
