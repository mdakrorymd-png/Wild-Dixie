import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

const TITLE = "حجز شاليهات العين السخنة — مباشرة وبدون رسوم خدمة | Wild Dixie";
const DESC =
  "احجز شاليه في العين السخنة مباشرة: دفع بالجنيه عبر إنستاباي، تواصل واتساب فوري، وتصريح البوابة جاهز قبل وصولك. بدون رسوم الخدمة الزيادة.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/sokhna` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}/sokhna`,
    images: [{ url: `${SITE_URL}/listings/beachfront/01.jpg`, width: 1200, height: 675, alt: "شاطئ العين السخنة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/listings/beachfront/01.jpg`],
  },
};

export default function SokhnaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
