"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PropertyListItem } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";

const HERO = "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80";
const SOON = ["الساحل الشمالي", "الجونة", "مرسى مطروح", "جنوب سيناء"];

export default function SokhnaPage() {
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [wlArea, setWlArea] = useState(SOON[0]);
  const [wlPhone, setWlPhone] = useState("");
  const [wlSent, setWlSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .searchProperties({ area: "Ain Sokhna", q: q || undefined, limit: 24 })
        .then((p) => {
          setItems(p.items);
          setError(false);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, reload]);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    await api.createLead({ kind: "waitlist", area: wlArea, whatsapp: wlPhone });
    setWlSent(true);
  }

  return (
    <div>
      <section className="full-bleed relative mb-10 h-[420px] overflow-hidden sm:h-[460px]">
        <Image src={HERO} alt="شاطئ العين السخنة" fill priority className="object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-16 text-center text-white">
          <span className="mb-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-brand-dark">العين السخنة — متاح الآن</span>
          <h1 className="text-3xl font-bold drop-shadow sm:text-4xl">شاليهات مُدارة باحتراف في العين السخنة</h1>
          <p className="mt-1 text-sm text-white/85">صور حقيقية · تصاريح بوابة مظبوطة · دعم واتساب فوري</p>
          <div className="mt-5 flex w-full max-w-lg items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-light text-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث: أزها، تلال، بورتو..." className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/50" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-1">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">شاليهات العين السخنة</h2>
          <span className="text-sm text-black/55">{items.length} عقار</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-black/5" />)}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-black/55">تعذّر تحميل العقارات دلوقتي. ممكن يكون السيرفر بيصحى — جرّب تاني بعد لحظات.</p>
            <button onClick={() => setReload((n) => n + 1)} className="btn-outline mt-4">إعادة المحاولة</button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-black/50">لا توجد عقارات مطابقة.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}

        {/* Coming soon + waitlist */}
        <div className="mt-10 rounded-3xl bg-brand p-6 text-white sm:p-8">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-xl font-bold text-gold">مناطق قادمة قريبًا</h3>
              <p className="mt-1 text-sm text-white/75">بنبدأ بالعين السخنة، وبعدها بنوسّع. سجّل واحنا نكلّمك أول ما نفتح منطقتك.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOON.map((a) => (
                  <span key={a} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">{a}</span>
                ))}
              </div>
            </div>
            {wlSent ? (
              <div className="rounded-2xl bg-white/10 p-5 text-center">
                <p className="font-bold text-gold">تمام! ✓</p>
                <p className="mt-1 text-sm text-white/80">هنكلّمك أول ما نفتح {wlArea}.</p>
              </div>
            ) : (
              <form onSubmit={joinWaitlist} className="flex flex-col gap-2 sm:flex-row">
                <select className="input text-brand" value={wlArea} onChange={(e) => setWlArea(e.target.value)}>
                  {SOON.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <input className="input text-brand" placeholder="رقم الواتساب" value={wlPhone} onChange={(e) => setWlPhone(e.target.value)} required />
                <button className="btn-primary whitespace-nowrap">انضم للقائمة</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
