import type { Metadata } from "next";
import { PropertyDetail } from "./PropertyDetail";
import { ogCover } from "@/lib/images";
import { SITE_URL } from "@/lib/site";

// Server-side fetch always hits the backend directly (absolute), independent of
// the client's (possibly relative/proxied) NEXT_PUBLIC_API_URL.
const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1";

async function getProperty(id: string) {
  try {
    const res = await fetch(`${API}/properties/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProperty(params.id);
  if (!p) return { title: "عقار غير موجود — Wild Dixie Escapes" };

  const title = `${p.title} — ${p.area} | Wild Dixie Escapes`;
  const price = Math.round(Number(p.base_price_per_night)).toLocaleString("en-US");
  const description = `${p.max_guests} ضيوف · ${p.bedrooms} غرف نوم · ${price} ج.م/الليلة. احجز الآن مع Wild Dixie Escapes.`;
  const url = `${SITE_URL}/properties/${p.id}`;
  const image = ogCover(p.id, p.property_type);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Wild Dixie Escapes",
      locale: "ar_EG",
      images: [{ url: image, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetail id={params.id} />;
}
