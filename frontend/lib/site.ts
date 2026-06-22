// Single source of truth for the public site origin used in share links,
// canonical URLs, and Open Graph / WhatsApp link previews.
// Defaults to the live production domain so previews work even when
// NEXT_PUBLIC_SITE_URL isn't set; override it for a custom domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://wild-dixie.vercel.app"
).replace(/\/$/, "");
