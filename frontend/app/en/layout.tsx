import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { OG_DEFAULT } from "@/lib/images";

const TITLE = "Wild Dixie Escapes — Holiday-rental management on Egypt's Red Sea";
const DESC =
  "Your Red Sea holiday home, earning while you're away. One plan at 20% of rent: listing, pricing, guests, cleaning, maintenance, licensing and a monthly statement in EUR. Ain Sokhna and Port Ghalib.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/en`, languages: { ar: SITE_URL, en: `${SITE_URL}/en` } },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/en`,
    siteName: "Wild Dixie Escapes",
    title: TITLE,
    description: DESC,
    locale: "en_GB",
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: "Wild Dixie Escapes" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [OG_DEFAULT] },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en" dir="ltr">{children}</div>;
}
