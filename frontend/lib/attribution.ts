// Captures UTM parameters from inbound links (ads, WhatsApp shares) so a booking
// can later be attributed to the campaign that drove it.
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function captureUtmsFromUrl(): void {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = sp.get(k);
    if (v) found[k] = v;
  }
  if (Object.keys(found).length > 0) {
    window.sessionStorage.setItem("attribution", JSON.stringify(found));
  }
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem("attribution") || "{}");
  } catch {
    return {};
  }
}
