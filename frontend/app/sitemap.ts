import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const API = process.env.API_INTERNAL_URL ?? "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/sokhna`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  // Public listing pages — best-effort; ship static routes alone if the API is down.
  let properties: MetadataRoute.Sitemap = [];
  if (API) {
    try {
      const res = await fetch(`${API}/properties?limit=100`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        properties = (data.items ?? []).map((p: { id: string }) => ({
          url: `${SITE_URL}/properties/${p.id}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
      }
    } catch {
      /* backend unavailable — static routes only */
    }
  }

  return [...staticRoutes, ...properties];
}
