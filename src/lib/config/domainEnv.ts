const TEST_HOSTS = new Set(["test.dshelper.kr", "localhost", "127.0.0.1"]);

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().split(":")[0] ?? "";
}

export function isTestHost(hostname: string): boolean {
  const normalized = normalizeHost(hostname);
  return TEST_HOSTS.has(normalized);
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
