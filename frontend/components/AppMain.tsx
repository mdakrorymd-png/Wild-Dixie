"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isEnglishPath } from "@/lib/lang";

// Routes with a full-bleed dark hero — the fixed navbar overlays them (no top pad).
const HERO_ROUTES = ["/", "/sokhna", "/en"];

export function AppMain({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const heroPage = HERO_ROUTES.includes(path);
  const en = isEnglishPath(path);

  // Root layout renders Arabic/RTL; flip the document for the English section.
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "ar";
    document.documentElement.dir = en ? "ltr" : "rtl";
  }, [en]);

  return (
    <main dir={en ? "ltr" : undefined} className={`mx-auto max-w-6xl px-4 pb-8 ${heroPage ? "" : "pt-28"}`}>
      {children}
    </main>
  );
}
