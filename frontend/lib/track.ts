// Thin wrapper around GA4 (gtag) + Meta Pixel (fbq). Both are optional — if the
// env vars in <Analytics/> aren't set, these calls are safe no-ops. This exists
// so every conversion point in the funnel (lead submitted, WhatsApp click,
// booking started) reports to whichever tools are actually configured, without
// each call site needing to know which ones are on.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type TrackEvent =
  | "lead_submitted"
  | "whatsapp_click"
  | "booking_started"
  | "booking_completed"
  | "waitlist_joined";

// Maps our event names to the closest Meta standard event so ad-platform
// optimization (e.g. "optimize for Leads") works out of the box.
const FB_STANDARD_EVENT: Partial<Record<TrackEvent, string>> = {
  lead_submitted: "Lead",
  waitlist_joined: "Lead",
  whatsapp_click: "Contact",
  booking_started: "InitiateCheckout",
  booking_completed: "Purchase",
};

export function track(event: TrackEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const fbEvent = FB_STANDARD_EVENT[event];
  if (fbEvent) window.fbq?.("track", fbEvent, params);
}
