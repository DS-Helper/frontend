const PRODUCTION_HOSTS = new Set(["dshelper.kr", "www.dshelper.kr", "admin.dshelper.kr"]);

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().split(":")[0] ?? "";
}

export function isTestHost(hostname: string): boolean {
  const normalized = normalizeHost(hostname);
  return !PRODUCTION_HOSTS.has(normalized);
}

export function getClientHostname(): string {
  if (typeof window === "undefined") return "";
  return normalizeHost(window.location.hostname);
}

export function pickValueByHost(
  hostname: string,
  productionValue: string | undefined,
  testValue: string | undefined
): string {
  const prod = productionValue?.trim() ?? "";
  const test = testValue?.trim() ?? "";

  if (isTestHost(hostname)) {
    return test || prod;
  }
  return prod || test;
}
