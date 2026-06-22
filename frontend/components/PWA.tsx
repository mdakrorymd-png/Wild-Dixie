"use client";

import { useEffect, useState } from "react";
import { captureUtmsFromUrl } from "@/lib/attribution";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Capture ad/share attribution (UTM) on every entry.
    captureUtmsFromUrl();

    // In development a cached service worker would serve stale JS/CSS and hide
    // code changes — so unregister any SW and clear its caches instead.
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      }
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[var(--shadow-hover)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">🌊</span>
        <div className="flex-1 text-sm">
          <p className="font-bold">ثبّت تطبيق ساحل</p>
          <p className="text-black/55">أضِفه إلى شاشتك الرئيسية لتجربة أسرع.</p>
        </div>
        <button
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
          }}
          className="btn-primary text-xs"
        >
          تثبيت
        </button>
        <button onClick={() => setHidden(true)} aria-label="إغلاق" className="rounded-full p-1.5 text-black/40 hover:bg-black/5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
