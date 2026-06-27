"use client";

import Image from "next/image";
import { useState } from "react";

const SIDE = "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[var(--shadow-soft)]">
      <div className="grid md:grid-cols-2">
        <div className="relative hidden min-h-[460px] md:block">
          <Image src={SIDE} alt="" fill className="object-cover" />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M2 16c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 11c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold leading-snug">إجازتك على البحر تبدأ من وايلد ديكسي</h2>
            <p className="mt-1 text-sm text-white/80">شاليهات وفيلات في الساحل الشمالي، السخنة، والجونة.</p>
          </div>
        </div>

        <div className="p-7 sm:p-9">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-black/50">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LabeledInput({
  icon,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";
  const type = isPassword ? (show ? "text" : "password") : props.type;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
      <span className="text-black/30">{icon}</span>
      <input {...props} type={type} className="w-full bg-transparent py-2.5 text-sm outline-none" />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          className="shrink-0 text-black/35 transition hover:text-black/60"
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.6M6.2 6.2C4.2 7.5 2.7 9.5 2 12c1 2.5 5 7 10 7 1.4 0 2.7-.3 3.9-.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
