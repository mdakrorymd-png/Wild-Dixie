"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { WHATSAPP_URL } from "@/lib/site";
import { useAuth } from "@/lib/auth";

const TRANSPARENT_ROUTES = ["/", "/sokhna"];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = user?.roles.includes("admin");
  const isHost = user?.roles.includes("host");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <NavLink href="/" label="الرئيسية للمُلّاك" active={pathname === "/"} light={overHero} />
          <NavLink href="/sokhna" label="احجز شاليه" active={pathname.startsWith("/sokhna")} light={overHero} />
          <NavLink href="/#pricing" label="الأسعار" light={overHero} />
          <NavLink href="/#faq" label="أسئلة" light={overHero} />
          {/* Staff-only links — hidden from guests, visible when logged in with the role. */}
          {isAdmin && <NavLink href="/admin" label="الإدارة" light={overHero} />}
          {isHost && <NavLink href="/host" label="عقاراتي" light={overHero} />}
          {user ? (
            <button onClick={logout} className={`rounded-full px-3 py-2 text-sm transition ${overHero ? "text-white/70 hover:text-white" : "text-black/45 hover:text-black/80"}`}>
              خروج
            </button>
          ) : (
            <>
              <NavLink href="/login" label="دخول" light={overHero} />
              <NavLink href="/register" label="أنشئ حساب" light={overHero} />
            </>
          )}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mr-1 text-base">
            واتساب
          </a>
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
            <MobileLink href="/" label="الرئيسية للمُلّاك" onClick={() => setOpen(false)} />
            <MobileLink href="/sokhna" label="احجز شاليه" onClick={() => setOpen(false)} />
            <MobileLink href="/#pricing" label="الأسعار" onClick={() => setOpen(false)} />
            <MobileLink href="/#faq" label="أسئلة" onClick={() => setOpen(false)} />
            {isAdmin && <MobileLink href="/admin" label="الإدارة" onClick={() => setOpen(false)} />}
            {isHost && <MobileLink href="/host" label="عقاراتي" onClick={() => setOpen(false)} />}
            {user ? (
              <button onClick={() => { setOpen(false); logout(); }} className="rounded-lg px-3 py-2.5 text-right text-red-600/80 transition hover:bg-red-50">
                خروج من الحساب
              </button>
            ) : (
              <>
                <MobileLink href="/login" label="دخول" onClick={() => setOpen(false)} />
                <MobileLink href="/register" label="أنشئ حساب" onClick={() => setOpen(false)} />
              </>
            )}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-2">واتساب</a>
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
