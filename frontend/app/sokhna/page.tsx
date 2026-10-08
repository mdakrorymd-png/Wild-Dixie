"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PropertyListItem } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { whatsappWith, AIRBNB_LISTING_URL } from "@/lib/site";

/* TODO: replace with real photo once a wide beach shot is supplied */
const HERO = "/listings/beachfront/01.jpg";

const BOOK_STEPS = [
  { n: "١", t: "اختار شاليهك", d: "تفرّج على الوحدات المتاحة، أو كلمنا واتساب لو محتار." },
  { n: "٢", t: "احجز وادفع عربون", d: "حدّد تواريخك وادفع العربون عبر إنستاباي أو المحفظة — بالجنيه وآمن." },
  { n: "٣", t: "استمتع بإجازتك", d: "تواصل مباشر معانا على واتساب، وتصريح البوابة جاهز قبل وصولك." },
];

const COMPARE = [
  { label: "رسوم خدمة إضافية على الضيف", us: "صفر — السعر واضح ومباشر", them: "١٥–٢٠٪ بتتضاف على السعر" },
  { label: "تواصل", us: "واتساب مباشر وفوري", them: "عبر المنصة فقط — ممنوع الاتصال" },
  { label: "طريقة الدفع", us: "إنستاباي / محفظة / بالجنيه", them: "كارت دولاري أو تحويل دولي" },
  { label: "معرفة بالسخنة", us: "فريق محلي يعرف كل كمبوند", them: "دعم عام بالإنجليزي" },
  { label: "تصريح البوابة والكمبوند", us: "بنجيبه لك قبل الوصول", them: "انت مسؤول تتواصل مع المالك" },
];

const GUEST_FAQ: [string, string][] = [
  ["إزاي أحجز؟", "اختار الوحدة، حدّد تواريخك، وادفع العربون عبر إنستاباي أو المحفظة الإلكترونية — أو احجز مباشرة عبر واتساب."],
  ["ليه أحجز مباشر مش من Airbnb؟", "نفس الوحدة — من غير رسوم الخدمة الزيادة، وتواصل واتساب مباشر، ودفع محلي بالجنيه."],
  ["الدفع بيتم إزاي؟", "العربون عبر إنستاباي / فودافون كاش / أورنج كاش — بالجنيه وموثّق."],
  ["سياسة الإلغاء إيه؟", "الإلغاء قبل ٧ أيام من الوصول بيرجّعلك المدفوع. الإلغاء خلال الـ٧ أيام بيخصم حسب سياسة الوحدة."],
  ["تصريح البوابة بيتعمل إزاي؟", "بنطلب رقمك القومي ولوحة عربيتك قبل الوصول وبنجهّز التصريح — بتدخل الكمبوند من غير أي تعقيد."],
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function SokhnaPage() {
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  useReveal();

  useEffect(() => {
    api
      .searchProperties({ area: "Ain Sokhna", limit: 24 })
      .then((p) => setItems(p.items))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ═══ HERO — guests ═══ */}
      <section className="full-bleed relative mb-12 flex h-[440px] items-center justify-center overflow-hidden sm:h-[500px]">
        <Image src={HERO} alt="شاطئ إمباير ريزورت — العين السخنة" fill priority sizes="100vw" className="object-cover" />
        <div className="hero-overlay-cinema absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center px-4 pt-16 text-center text-white">
          <span className="mb-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-brand-dark">العين السخنة — متاح الآن</span>
          <h1 className="max-w-2xl text-3xl font-bold drop-shadow sm:text-5xl">احجز شاليهك مباشرة — بدون رسوم زيادة</h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">تصاريح بوابة مظبوطة · دفع بالجنيه · دعم واتساب فوري</p>
          <a
            href={whatsappWith("عايز أحجز شاليه في العين السخنة")}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary mt-6 px-8 py-3"
          >
            احجز عبر واتساب
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">

        {/* ═══ LISTINGS — never an empty grid ═══ */}
        <section className="pb-16">
          <div className="reveal mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">الوحدات المتاحة</h2>
            {items.length > 0 && <span className="text-sm text-black/45">{items.length} وحدة</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-black/5" />)}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          ) : (
            /* Fallback: the real unit as a rich card — never a zero state. */
            <div className="card overflow-hidden sm:flex">
              <div className="relative h-64 sm:h-auto sm:w-1/2">
                <Image src="/listings/beachfront/01.jpg" alt="Beachfront First Row — إمباير ريزورت" fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-7 sm:w-1/2">
                <h3 className="text-2xl font-bold">Beachfront First Row — إمباير ريزورت</h3>
                <p className="mt-2 text-sm leading-7 text-black/55">أول صف على البحر مباشرة · غرفتين · حتى ٦ ضيوف</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/sokhna/beachfront-first-row" className="btn-navy px-6">التفاصيل والحجز</Link>
                  <a href={whatsappWith("عايز أحجز Beachfront First Row في إمباير ريزورت")} target="_blank" rel="noopener noreferrer" className="btn-outline px-6">واتساب</a>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══ WHY DIRECT — comparison ═══ */}
        <section className="pb-16">
          <div className="reveal mb-10 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">مقارنة مباشرة</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">ليه تحجز مباشر؟</h2>
            <p className="mt-2 text-sm text-black/50">نفس الوحدة — بأوفر وأوضح وأسرع من المنصات العالمية.</p>
          </div>
          <div className="reveal overflow-hidden rounded-3xl border border-brand/10 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-[1.8fr_1fr_1fr] bg-brand text-white">
              <div className="px-6 py-4 text-xs font-medium text-white/40">المعيار</div>
              <div className="px-4 py-4 text-center text-sm font-bold text-gold">وايلد ديكسي ✓</div>
              <div dir="ltr" className="px-4 py-4 text-center text-xs font-medium text-white/35">Airbnb / Booking</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-[1.8fr_1fr_1fr] gap-px text-sm ${i % 2 === 0 ? "bg-white" : "bg-brand/[0.025]"}`}>
                <div className="px-6 py-4 font-medium text-black/70">{row.label}</div>
                <div className="flex items-center justify-center gap-1.5 px-4 py-4 text-center font-medium text-brand">{row.us}</div>
                <div className="flex items-center justify-center gap-1.5 px-4 py-4 text-center text-black/40">{row.them}</div>
              </div>
            ))}
          </div>
          {AIRBNB_LISTING_URL && (
            <p className="reveal mt-4 text-center text-sm">
              <a href={AIRBNB_LISTING_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">
                شوف تقييماتنا الحقيقية على Airbnb ←
              </a>
            </p>
          )}
        </section>

        {/* ═══ HOW TO BOOK ═══ */}
        <section className="pb-16">
          <div className="reveal mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">العملية</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">احجز في ٣ خطوات</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            <div className="absolute top-9 right-[16.7%] left-[16.7%] hidden h-px bg-gradient-to-l from-gold/40 via-gold/20 to-gold/40 sm:block" />
            {BOOK_STEPS.map((s, i) => (
              <div key={s.n} className={`reveal d${i + 1} flex flex-col items-center text-center`}>
                <div className="relative mb-5 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-brand text-3xl font-bold text-gold shadow-[0_0_0_6px_rgba(11,46,60,0.1)] ring-1 ring-brand/20">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-7 text-black/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ GUEST FAQ ═══ */}
        <section className="pb-16">
          <div className="reveal mb-8 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">أسئلة شائعة</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">عندك سؤال؟</h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-2">
            {GUEST_FAQ.map(([q, a]) => (
              <details key={q} className="reveal card group overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium transition-colors hover:text-brand">
                  {q}
                  <span className="text-gold-dark text-lg transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-brand/[0.06] px-6 py-4 text-sm leading-7 text-black/60">{a}</p>
              </details>
            ))}
          </div>
          <p className="reveal mt-6 text-center text-sm">
            <Link href="/sokhna/guide" className="font-semibold text-brand underline underline-offset-4">
              دليل العين السخنة والزعفرانة — الكمبوندات والأسعار وأفضل وقت ←
            </Link>
          </p>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="pb-16">
          <div className="reveal rounded-3xl bg-brand px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">إجازتك على بُعد رسالة واحدة</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/65">ابعتلنا التواريخ اللي عايزها — وهنرد عليك في دقايق.</p>
            <a
              href={whatsappWith("عايز أحجز شاليه في العين السخنة")}
              target="_blank" rel="noopener noreferrer"
              className="btn-primary mt-6 inline-flex px-8 py-3"
            >
              احجز عبر واتساب
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
