const SCRAP_STORAGE_KEY = "boardScrapIds";

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCRAP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function readScrapIds(): string[] {
  return readRaw();
}

export function writeScrapIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCRAP_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("boardScrapUpdated"));
}

export function toggleScrapId(boardId: string): string[] {
  const ids = readRaw();
  const set = new Set(ids);
  if (set.has(boardId)) set.delete(boardId);
  else set.add(boardId);
  const next = [...set];
  writeScrapIds(next);
  return next;
}

export function isScrapId(boardId: string): boolean {
  return readRaw().includes(boardId);
}
