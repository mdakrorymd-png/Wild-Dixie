"use client";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "201033388003";

export function WhatsAppFab() {
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent("مرحبًا وايلد ديكسي، عايز أعرف أكتر عن إدارة وحدتي 🏖️")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل واتساب"
      className="no-print fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.5.3.1.3.1.7-.1 1.1Z" />
      </svg>
    </a>
  );
}
