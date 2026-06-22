"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site";

export function ShareProperty({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function shareUrl(source: string): string {
    const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/properties/${id}?utm_source=${source}&utm_medium=share&utm_campaign=listing`;
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl("whatsapp")}`)}`;

  async function copy() {
    await navigator.clipboard.writeText(shareUrl("copy"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function nativeShare() {
    const url = shareUrl("native");
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-black/60">شارك العقار:</span>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-2 text-sm font-medium text-white transition hover:brightness-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.5.3.1.3.1.7-.1 1.1Z" />
        </svg>
        واتساب
      </a>
      <button onClick={copy} className="btn-outline text-sm">
        {copied ? "تم النسخ ✓" : "نسخ الرابط"}
      </button>
      <button onClick={nativeShare} className="btn-outline text-sm">
        مشاركة
      </button>
    </div>
  );
}
