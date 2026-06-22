"use client";

import { usePathname } from "next/navigation";

// Routes with a full-bleed dark hero — the fixed navbar overlays them (no top pad).
const HERO_ROUTES = ["/", "/sokhna"];

export function AppMain({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const heroPage = HERO_ROUTES.includes(path);
  return (
    <main className={`mx-auto max-w-6xl px-4 pb-8 ${heroPage ? "" : "pt-28"}`}>
      {children}
    </main>
  );
}
