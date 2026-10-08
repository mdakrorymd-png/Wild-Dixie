"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { whatsappWith } from "@/lib/site";

type Facts = {
  resort: string;
  area: string;
  row: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  priceFrom: number;
  priceWeekday: number;
  priceWeekend: number;
};

export function ListingClient({
  photos,
  facts,
  amenities,
  airbnbUrl,
}: {
  photos: string[];
  facts: Facts;
  amenities: string[];
  airbnbUrl: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [booked, setBooked] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    fetch("/api/availability/beachfront")
      .then((r) => r.json())
      .then((d) => setBooked(d.booked ?? []))
      .catch(() => undefined);
  }, []);

  // A selected [checkIn, checkOut) overlaps a booked [start, end) range.
  const conflict =
    checkIn && checkOut
      ? booked.some((b) => checkIn < b.end && checkOut > b.start)
      : false;

  const waMessage =
    checkIn && checkOut
      ? `عايز أحجز Beachfront First Row من ${checkIn} لـ ${checkOut}`
      : "عايز أحجز Beachfront First Row — إمباير ريزورت";
  const waHref = whatsappWith(waMessage);

  return (
    <div className="pb-24 sm:pb-0">
      {/* Gallery */}
      <div className="relative mb-6 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button type="button" onClick={() => setLightbox(0)} className="relative col-span-4 h-64 row-span-2 bg-brand-light sm:col-span-2 sm:h-[380px]">
          <Image src={photos[0]} alt="Beachfront First Row — الواجهة" fill priority sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
        </button>
        {photos.slice(1, 4).map((src, i) => (
          <button type="button" key={src} onClick={() => setLightbox(i + 1)} className={`relative hidden bg-brand-light sm:block ${i === 0 ? "col-span-2" : ""}`}>
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="absolute bottom-3 left-3 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-brand shadow-md hover:bg-white"
        >
          شوف كل الصور ({photos.length})
        </button>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">{lightbox + 1} / {photos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="text-2xl leading-none" aria-label="إغلاق">×</button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[lightbox]} alt="" fill sizes="100vw" className="object-contain" />
            {lightbox > 0 && (
              <button type="button" onClick={() => setLightbox((i) => (i ?? 0) - 1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30" aria-label="السابق">‹</button>
            )}
            {lightbox < photos.length - 1 && (
              <button type="button" onClick={() => setLightbox((i) => (i ?? 0) + 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30" aria-label="التالي">›</button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto p-3" onClick={(e) => e.stopPropagation()}>
            {photos.map((src, i) => (
              <button type="button" key={src} onClick={() => setLightbox(i)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ${i === lightbox ? "ring-2 ring-gold" : "opacity-60"}`}>
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2">
          <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">{facts.resort} · {facts.area}</span>
          <h1 className="mt-1 text-3xl font-bold">Beachfront First Row</h1>
          <p className="mt-1 text-black/55">{facts.row}</p>

          <div className="mt-5 flex flex-wrap gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 text-sm">
            <Spec n={facts.maxGuests} label="ضيوف" />
            <Spec n={facts.bedrooms} label="غرف نوم" />
            <Spec n={facts.bathrooms} label="حمام" />
          </div>

          <h2 className="mt-8 text-xl font-bold">المرافق</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {amenities.map((a) => (
              <li key={a} className="flex items-center gap-2 text-black/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gold-dark">
                  <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-bold">عن الوحدة</h2>
          <p className="mt-3 leading-8 text-black/65">
            شاليه دوبلكس في أول صف على البحر مباشرة داخل إمباير ريزورت بالعين السخنة — بلكونتين بإطلالة بحرية
            وحديقة خاصة، على بُعد خطوات من الشاطئ. تصريح البوابة بنجهّزه لك قبل وصولك، وكل التواصل مباشر معانا
            على واتساب.
          </p>

          {airbnbUrl && (
            <div className="mt-8 rounded-2xl border border-brand/10 bg-brand-light/30 p-5">
              <p className="font-bold text-brand">نفس الوحدة على Airbnb — قارن السعر بنفسك</p>
              <p className="mt-1 text-sm text-black/55">تقييمات حقيقية من ضيوف حقيقيين. الحجز المباشر أوفر لأن مفيش رسوم خدمة.</p>
              <a href={airbnbUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 inline-flex px-5">
                شوف التقييمات على Airbnb ←
              </a>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <p className="text-sm text-black/50">السعر يبدأ من</p>
            <p className="text-3xl font-bold text-brand">
              <bdi dir="ltr">{facts.priceFrom.toLocaleString("en-US")}</bdi>{" "}
              <span className="text-base font-normal text-black/50">ج.م / الليلة</span>
            </p>
            <div className="mt-3 space-y-1.5 rounded-xl bg-brand-light/40 px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-black/55">أيام الأسبوع</span>
                <span className="font-bold text-brand"><bdi dir="ltr">{facts.priceWeekday.toLocaleString("en-US")}</bdi> ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/55">نهاية الأسبوع (خميس–جمعة)</span>
                <span className="font-bold text-brand"><bdi dir="ltr">{facts.priceWeekend.toLocaleString("en-US")}</bdi> ج.م</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gold-dark">من غير أي رسوم خدمة</p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-black/50">الوصول</span>
                <input type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-black/50">المغادرة</span>
                <input type="date" className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || undefined} />
              </label>
            </div>

            {conflict && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
                التواريخ دي محجوزة — جرّب فترة تانية أو اسألنا على واتساب.
              </p>
            )}
            <a
              href={waHref}
              target="_blank" rel="noopener noreferrer"
              className={`mt-4 w-full py-3 text-base ${conflict ? "btn border border-brand/20 bg-white text-brand" : "btn-primary"}`}
            >
              {conflict ? "اسأل عن تواريخ تانية" : "اتأكد من التواريخ على واتساب"}
            </a>
            {booked.length > 0 && (
              <p className="mt-2 text-center text-[11px] text-black/40">الإتاحة محدّثة مباشرة من تقويم الوحدة.</p>
            )}
            <p className="mt-3 text-center text-xs text-black/40">
              الدفع بالجنيه: إنستاباي / فودافون كاش · عربون لتأكيد الحجز
            </p>
          </div>
        </div>
      </div>

      {/* Sticky mobile WhatsApp bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <div>
          <p className="text-sm font-bold text-brand">
            <bdi dir="ltr">{facts.priceFrom.toLocaleString("en-US")}</bdi> ج.م <span className="font-normal text-black/45">/ الليلة</span>
          </p>
          <p className="text-[11px] text-black/45">من غير رسوم خدمة</p>
        </div>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 max-w-[200px] py-2.5 text-sm">
          احجز واتساب
        </a>
      </div>
    </div>
  );
}

function Spec({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <b className="text-brand">{n}</b> <span className="text-black/55">{label}</span>
    </span>
  );
}
