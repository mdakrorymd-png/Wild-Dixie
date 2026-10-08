// Single source of truth for the public site origin used in share links,
// canonical URLs, and Open Graph / WhatsApp link previews.
// Defaults to the live production domain so previews work even when
// NEXT_PUBLIC_SITE_URL isn't set; override it for a custom domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.wilddixie.com"
).replace(/\/$/, "");

// All conversion resolves to WhatsApp — one number, prefill per context.
export const WHATSAPP_NUMBER = "201033388003";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappWith(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

// Real Airbnb listing for Beachfront First Row (owner-supplied 2026-07-04).
// Used for the honest "same unit — compare the price yourself" trust link.
export const AIRBNB_LISTING_URL =
  "https://www.airbnb.com/rooms/1635957091758972509";

// Real nightly rates in EGP (owner-supplied). Latin numerals for prices.
export const BEACHFRONT_RATES = {
  weekday: 5000,
  weekend: 6000,
} as const;
