import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/authenticated areas — no value to search engines.
      disallow: ["/admin", "/host", "/host/new", "/owners/", "/bookings", "/profile", "/login", "/register"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
