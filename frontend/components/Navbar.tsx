"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

const TRANSPARENT_ROUTES = ["/", "/sokhna"];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHost = user?.roles.includes("host");
  const isAdmin = user?.roles.includes("admin");
  const listHref = !user ? "/register" : isHost ? "/host" : "/profile";
  // Transparent (white text) only over a dark hero, at the top, menu closed.
  const overHero = TRANSPARENT_ROUTES.includes(pathname) && !scrolled && !open;

  const shell = overHero
    ? "bg-transparent"
    : "bg-white/35 backdrop-blur-2xl border-b border-white/30 shadow-[0_6px_24px_-10px_rgba(11,46,60,0.25)] supports-[backdrop-filter]:bg-white/25";
  const text = overHero ? "text-white" : "text-brand";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${shell}`}>
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-5 py-5 sm:px-9 sm:py-[1.6rem]">
        <Link href="/">
          <Logo light={overHero} />
        </Link>

        <nav className="hidden items-center gap-1 text-base md:flex">
          <NavLink href="/sokhna" label="احجز شاليه" active={pathname === "/sokhna"} light={overHero} />
          <NavLink href="/#list" label="اعرض وحدتك" light={overHero} />
          <NavLink href="/#manage" label="الإدارة الكاملة" light={overHero} />
          <NavLink href="/#pricing" label="الأسعار" light={overHero} />
          {isHost && <NavLink href="/owners/dashboard" label="لوحة المالك" light={overHero} />}
          {isHost && <NavLink href="/host" label="عقاراتي" light={overHero} />}
          {isAdmin && <NavLink href="/admin" label="الإدارة" light={overHero} />}
          {!loading && user ? (
            <>
              <NavLink href="/bookings" label="حجوزاتي" light={overHero} />
              <Link href="/profile" className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition ${overHero ? "border-white/30 text-white" : "border-brand/10 text-brand hover:border-brand/25"}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-brand-dark">
                  {user.full_name.trim().charAt(0)}
                </span>
                <span className="max-w-[80px] truncate">{user.full_name.split(" ")[0]}</span>
              </Link>
              <button onClick={logout} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${overHero ? "text-white/70 hover:text-white" : "text-black/50 hover:bg-black/5 hover:text-black/80"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 12H3m0 0 4-4m-4 4 4 4M21 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                خروج
              </button>
            </>
          ) : (
            <NavLink href="/login" label="دخول" light={overHero} />
          )}
          <Link href={listHref} className="btn-primary mr-1 text-base">اعرض وحدتك</Link>
        </nav>

        <button onClick={() => setOpen((v) => !v)} aria-label="القائمة" className={`rounded-lg p-2 md:hidden ${text}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-brand/10 bg-white px-4 py-3 text-sm md:hidden">
          <div className="flex flex-col gap-1">
            <MobileLink href="/sokhna" label="احجز شاليه" onClick={() => setOpen(false)} />
            <MobileLink href="/#list" label="اعرض وحدتك" onClick={() => setOpen(false)} />
            <MobileLink href="/#manage" label="الإدارة الكاملة" onClick={() => setOpen(false)} />
            <MobileLink href="/#pricing" label="الأسعار" onClick={() => setOpen(false)} />
            {user ? (
              <>
                <MobileLink href="/bookings" label="حجوزاتي" onClick={() => setOpen(false)} />
                {isHost && <MobileLink href="/owners/dashboard" label="لوحة المالك" onClick={() => setOpen(false)} />}
                {isHost && <MobileLink href="/host" label="عقاراتي" onClick={() => setOpen(false)} />}
                {isAdmin && <MobileLink href="/admin" label="الإدارة" onClick={() => setOpen(false)} />}
                <MobileLink href="/profile" label="حسابي" onClick={() => setOpen(false)} />
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="rounded-lg px-3 py-2.5 text-right text-sm text-red-600/80 transition hover:bg-red-50"
                >
                  خروج من الحساب
                </button>
              </>
            ) : (
              <MobileLink href="/login" label="دخول" onClick={() => setOpen(false)} />
            )}
            <Link href={listHref} onClick={() => setOpen(false)} className="btn-primary mt-2">اعرض وحدتك</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, label, active, light }: { href: string; label: string; active?: boolean; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`relative rounded-full px-3 py-2 transition ${
        light ? "text-white/85 hover:text-white" : "text-brand/80 hover:text-brand"
      } ${active ? "font-bold" : ""}`}
    >
      {label}
      {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />}
    </Link>
  );
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-lg px-3 py-2.5 text-brand/80 transition hover:bg-brand/5">
      {label}
    </Link>
  );
}
