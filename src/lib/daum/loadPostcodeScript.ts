const POSTCODE_SCRIPT_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 사용할 수 있습니다."));
  }
  if (window.daum?.Postcode) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${POSTCODE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.daum?.Postcode) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("우편번호 스크립트를 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = POSTCODE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("우편번호 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}
