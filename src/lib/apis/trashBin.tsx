import { instance } from "./axios";
import type { TrashBinApiItem } from "@/types/trashBin";

function parseNumberInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

const TOTAL_PAGES_KEYS = ["totalPages", "total_pages"] as const;

function readTotalPagesFromNested(obj: Record<string, unknown>): number | null {
  for (const key of TOTAL_PAGES_KEYS) {
    const n = parseNumberInt(obj[key]);
    if (n != null && n >= 0) {
      const MAX_PAGES = 1_000_000;
      return Math.min(n, MAX_PAGES);
    }
  }
  return null;
}

/**
 * 페이지 수 해석 순서:
 * 1. `data.page.totalPages`(표준) — `trashBins`와 형제인 `page` 블록
 * 2. `data`·루트에 직접 붙은 `totalPages`(구형/다른 계약)
 */
function readTrashBinsTotalPages(
  root: Record<string, unknown>,
  payload: Record<string, unknown>
): number {
  const pageMeta =
    payload.page != null && typeof payload.page === "object" && !Array.isArray(payload.page)
      ? (payload.page as Record<string, unknown>)
      : null;
  if (pageMeta) {
    const fromMeta = readTotalPagesFromNested(pageMeta);
    if (fromMeta != null) return fromMeta;
  }

  for (const b of [payload, root]) {
    const n = readTotalPagesFromNested(b);
    if (n != null) return n;
  }
  return 1;
}

/** 한 페이지 분량 파싱: `items` + `totalPages`(없으면 1) */
function parseTrashBinsPage(body: unknown): {
  items: TrashBinApiItem[];
  totalPages: number;
} | null {
  if (body == null || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const nestedData =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;
  const payload = nestedData ?? root;
  const rawArr = payload.trashBins;
  if (!Array.isArray(rawArr)) return null;

  const items: TrashBinApiItem[] = [];
  for (const entry of rawArr) {
    if (entry == null || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    const latRaw = o.latitude;
    const lngRaw = o.longitude;
    const latitude =
      typeof latRaw === "number" ? latRaw : typeof latRaw === "string" ? Number(latRaw) : NaN;
    const longitude =
      typeof lngRaw === "number" ? lngRaw : typeof lngRaw === "string" ? Number(lngRaw) : NaN;
    if (!id || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    items.push({
      id,
      provinceName: typeof o.provinceName === "string" ? o.provinceName : "",
      cityCountyName: typeof o.cityCountyName === "string" ? o.cityCountyName : "",
      address: typeof o.address === "string" ? o.address : "",
      photoUrl:
        o.photoUrl === null
          ? null
          : typeof o.photoUrl === "string"
            ? o.photoUrl.trim() || null
            : null,
      locationDescription:
        typeof o.locationDescription === "string" ? o.locationDescription : "",
      installationPoint: typeof o.installationPoint === "string" ? o.installationPoint : "",
      binType: typeof o.binType === "string" ? o.binType : "",
      managementAgencyName:
        typeof o.managementAgencyName === "string" ? o.managementAgencyName : "",
      managementAgencyPhoneNumber:
        typeof o.managementAgencyPhoneNumber === "string"
          ? o.managementAgencyPhoneNumber
          : "",
      latitude,
      longitude,
      dataReferenceDate: typeof o.dataReferenceDate === "string" ? o.dataReferenceDate : "",
      existsYn:
        o.existsYn === null || o.existsYn === undefined ? null : String(o.existsYn),
    });
  }

  const totalPages = readTrashBinsTotalPages(root, payload);
  return { items, totalPages };
}

/** 수거함 목록은 고정 페이지 조건으로 1회 조회 (`page=0`, `size=100`). */
async function fetchTrashBinsPage(): Promise<{
  items: TrashBinApiItem[];
  totalPages: number;
} | null> {
  const res = await instance.get<unknown>("/trash-bins", {
    params: { page: 0, size: 100 },
  });
  return parseTrashBinsPage(res.data);
}

/** 동시 전체 조회 한 번만 (같은 Promise 공유) */
let binsInflight: Promise<TrashBinApiItem[] | null> | null = null;

/**
 * 직전 성공 결과 짧게 재사용 — HMR·라우트 재마운트 등에서 연속 호출 시 네트워크 중복 완화
 */
let binsRecentValue: TrashBinApiItem[] | null | undefined;
let binsRecentUntil = 0;
const RECENT_TRASH_BINS_MS = 2000;

export const getTrashBins = async (): Promise<TrashBinApiItem[] | null> => {
  const now = Date.now();
  if (now < binsRecentUntil && binsRecentValue !== undefined) {
    return binsRecentValue;
  }
  if (binsInflight) return binsInflight;

  binsInflight = (async (): Promise<TrashBinApiItem[] | null> => {
    try {
      const page0 = await fetchTrashBinsPage();
      if (!page0) return null;
      binsRecentValue = page0.items;
      binsRecentUntil = Date.now() + RECENT_TRASH_BINS_MS;
      return page0.items;
    } catch (e) {
      console.error(e);
      return null;
    }
  })().finally(() => {
    binsInflight = null;
  });

  return binsInflight;
};
