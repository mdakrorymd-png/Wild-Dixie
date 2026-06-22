// Curated, verified-stable Unsplash photos used as cover images so the demo
// looks real even though the seeded image URLs are placeholders.

// Warm, inviting photos — golden light, cozy interiors, sunset beaches.
const POOL: string[] = [
  "photo-1473116763249-2faaef81ccda", // golden sunset over water
  "photo-1506929562872-bb421503ef21", // warm beach sunset
  "photo-1522708323590-d24dbb6b0267", // cozy warm living room
  "photo-1493809842364-78817add7ffb", // warm inviting interior
  "photo-1540202404-a2f29016b523", // warm coastal
  "photo-1571003123894-1f0594d2b5d9", // resort pool (golden)
  "photo-1564013799919-ab600027ffc6", // modern house
  "photo-1502672260266-1c1ef2d93688", // bright warm interior
  "photo-1613490493576-7fde63acd811", // villa with pool
  "photo-1519046904884-53103b34b206", // warm beach loungers
];

const TYPE_START: Record<string, number> = {
  chalet: 0,
  villa: 3,
  apartment: 9,
  studio: 8,
  cabin: 5,
  room: 6,
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function urlFor(photo: string, w: number): string {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&q=80`;
}

export function coverImage(id: string, type: string, w = 800): string {
  const start = TYPE_START[type] ?? 0;
  return urlFor(POOL[(start + hash(id)) % POOL.length], w);
}

// 1200x630 social-share card image (Open Graph / WhatsApp preview).
export function ogCover(id: string, type: string): string {
  const start = TYPE_START[type] ?? 0;
  const photo = POOL[(start + hash(id)) % POOL.length];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&h=630&q=80`;
}

const AREA_PHOTO: Record<string, string> = {
  "North Coast": "photo-1506929562872-bb421503ef21",
  "Ain Sokhna": "photo-1473116763249-2faaef81ccda",
  "Red Sea": "photo-1571003123894-1f0594d2b5d9",
  "South Sinai": "photo-1540202404-a2f29016b523",
  Alexandria: "photo-1519046904884-53103b34b206",
  "Marsa Matrouh": "photo-1506929562872-bb421503ef21",
};

// Warm, welcoming hero image for landing sections.
export const WARM_HERO = "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=80";

// 1200x630 default social-share card (Open Graph / WhatsApp preview for pages
// without their own image, e.g. the home page).
export const OG_DEFAULT = "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&h=630&q=80";

export function areaImage(area: string, w = 600): string {
  const photo = AREA_PHOTO[area] ?? POOL[hash(area) % POOL.length];
  return urlFor(photo, w);
}

export function galleryImages(id: string, type: string): string[] {
  const start = (TYPE_START[type] ?? 0) + hash(id);
  return Array.from({ length: 4 }, (_, i) => urlFor(POOL[(start + i) % POOL.length], 1000));
}
