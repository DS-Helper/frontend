import axios from "axios";
import { instance } from "./axios";
import type { PublicToiletApiItem } from "@/types/toilet";

function logToiletApiError(context: string, e: unknown, requestParams?: unknown): void {
  if (axios.isAxiosError(e)) {
    console.error(
      `[${context}] ${e.response?.status ?? "network error"}:`,
      e.response?.data ?? e.message,
      requestParams !== undefined ? { requestParams } : ""
    );
    return;
  }
  console.error(`[${context}]`, e);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function readNullableString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  return typeof value === "string" ? value : null;
}

function readNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function parseToiletItem(value: unknown): PublicToiletApiItem | null {
  if (!isRecord(value)) return null;
  const id = readString(value, "id");
  const latitude = readNumber(value, "latitude");
  const longitude = readNumber(value, "longitude");
  if (!id || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id,
    localGovernmentCode: readString(value, "localGovernmentCode"),
    managementNumber: readString(value, "managementNumber"),
    categoryName: readString(value, "categoryName"),
    legalBasisName: readString(value, "legalBasisName"),
    toiletName: readString(value, "toiletName"),
    roadAddress: readString(value, "roadAddress"),
    parcelAddress: readString(value, "parcelAddress"),
    latitude,
    longitude,
    maleToiletCount: readNumber(value, "maleToiletCount"),
    maleUrinalCount: readNumber(value, "maleUrinalCount"),
    maleDisabledToiletCount: readNumber(value, "maleDisabledToiletCount"),
    maleDisabledUrinalCount: readNumber(value, "maleDisabledUrinalCount"),
    maleChildToiletCount: readNumber(value, "maleChildToiletCount"),
    maleChildUrinalCount: readNumber(value, "maleChildUrinalCount"),
    femaleToiletCount: readNumber(value, "femaleToiletCount"),
    femaleDisabledToiletCount: readNumber(value, "femaleDisabledToiletCount"),
    femaleChildToiletCount: readNumber(value, "femaleChildToiletCount"),
    managementAgencyName: readString(value, "managementAgencyName"),
    phoneNumber: readString(value, "phoneNumber"),
    openingHours: readString(value, "openingHours"),
    openingHoursDetail: readString(value, "openingHoursDetail"),
    installationYearMonth: readNullableString(value, "installationYearMonth"),
    ownershipTypeName: readString(value, "ownershipTypeName"),
    wasteTreatmentMethod: readString(value, "wasteTreatmentMethod"),
    safetyFacilityTargetYn: readString(value, "safetyFacilityTargetYn"),
    emergencyBellYn: readString(value, "emergencyBellYn"),
    emergencyBellLocation: readNullableString(value, "emergencyBellLocation"),
    entranceCctvYn: readString(value, "entranceCctvYn"),
    diaperChangingTableYn: readString(value, "diaperChangingTableYn"),
    diaperChangingTableLocation: readNullableString(value, "diaperChangingTableLocation"),
    remodelingYearMonth: readNullableString(value, "remodelingYearMonth"),
    dataReferenceDate: readString(value, "dataReferenceDate"),
    dataUpdateType: readString(value, "dataUpdateType"),
    dataUpdateTime: readString(value, "dataUpdateTime"),
    lastModifiedTime: readString(value, "lastModifiedTime"),
  };
}

/** 주어진 좌표·반경(현재 지도 뷰포트 기준) 내 화장실 목록 */
export const getNearbyToilets = async (
  latitude: number,
  longitude: number,
  radiusMeters: number
): Promise<PublicToiletApiItem[] | null> => {
  const params = { latitude, longitude, radiusMeters: Math.round(radiusMeters) };
  try {
    console.log("[getNearbyToilets] 요청 파라미터:", params);
    const res = await instance.get<unknown>("/public-toilets/nearby", { params });
    const root = res.data;
    const data = isRecord(root) ? root.data : null;
    const rawList = isRecord(data) ? data.publicToilets : null;
    if (!Array.isArray(rawList)) return null;

    return rawList
      .map(parseToiletItem)
      .filter((item): item is PublicToiletApiItem => item !== null);
  } catch (e) {
    logToiletApiError("getNearbyToilets", e, params);
    return null;
  }
};
