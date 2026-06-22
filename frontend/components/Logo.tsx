// Wild Dixie Escapes brand lockup: a coastal "sunset over the sea" emblem + wordmark.

export function Emblem({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden role="img">
      <circle cx="22" cy="22" r="21" fill="#0B2E3C" />
      <circle cx="22" cy="22" r="21" fill="none" stroke="#C9A24B" strokeWidth="1.4" />
      <circle cx="22" cy="18.5" r="4.4" fill="#C9A24B" />
      <path d="M8 27c3 0 3 2 6 2s3-2 6-2 3 2 6 2 3-2 6-2" stroke="#C9A24B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M9.5 32c2.6 0 2.6 1.7 5.2 1.7s2.6-1.7 5.2-1.7 2.6 1.7 5.2 1.7 2.6-1.7 5.2-1.7" stroke="#C9A24B" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  );
}

export function Logo({ light = false, size = 46 }: { light?: boolean; size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Emblem size={size} />
      <span className="leading-none">
        <span className={`block text-[22px] font-bold tracking-tight ${light ? "text-white" : "text-brand"}`}>
          Wild Dixie
        </span>
        <span className="block text-[12px] font-semibold tracking-[0.3em] text-gold">ESCAPES</span>
      </span>
    </span>
  );
}
