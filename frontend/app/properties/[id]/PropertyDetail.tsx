"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Property, Quote, PriceQuote } from "@/lib/types";
import { egp, propertyTypeAr } from "@/lib/format";
import { galleryImages } from "@/lib/images";
import { ShareProperty } from "@/components/ShareProperty";

export function PropertyDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [prop, setProp] = useState<Property | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isDeposit, setIsDeposit] = useState(false);
  const [carPlate, setCarPlate] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getProperty(id).then(setProp).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null);
      setPriceQuote(null);
      return;
    }
    // Public price quote — shows per-night breakdown + discounts
    api.getPriceQuote(id, checkIn, checkOut).then(setPriceQuote).catch(() => setPriceQuote(null));
    // Booking quote — only needed when logged in (payment amounts, deposit)
    if (!user) return;
    api
      .quote({ property_id: id, check_in: checkIn, check_out: checkOut, guests, is_deposit: isDeposit })
      .then((q) => { setQuote(q); setError(null); })
      .catch((e) => { setQuote(null); setError(e.message); });
  }, [id, checkIn, checkOut, guests, isDeposit, user]);

  async function book() {
    if (!user) return router.push("/login");
    setBusy(true);
    setError(null);
    try {
      const booking = await api.createBooking({ property_id: id, check_in: checkIn, check_out: checkOut, guests, is_deposit: isDeposit, car_plate: carPlate || undefined });
      router.push(`/bookings/${booking.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر إنشاء الحجز");
    } finally {
      setBusy(false);
    }
  }

  if (!prop) return <p className="py-12 text-center text-black/50">{error ?? "جارٍ التحميل…"}</p>;
  const canDeposit = prop.down_payment_percentage > 0;
  const gallery = galleryImages(prop.id, prop.property_type);

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <div className="relative col-span-4 h-64 row-span-2 bg-brand-light sm:col-span-2 sm:h-[340px]">
          <Image src={gallery[0]} alt={prop.title} fill priority sizes="50vw" className="object-cover" />
        </div>
        {gallery.slice(1, 4).map((src, i) => (
          <div key={i} className={`relative hidden bg-brand-light sm:block ${i === 0 ? "col-span-2" : ""}`}>
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{prop.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-black/55">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
                {prop.resort?.name ? `${prop.resort.name} — ` : ""}
                {prop.area}
              </p>
            </div>
            <span className="badge bg-brand-light text-brand-dark">{propertyTypeAr(prop.property_type)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 text-sm">
            <Spec n={prop.max_guests} label="ضيوف" />
            <Spec n={prop.bedrooms} label="غرف نوم" />
            <Spec n={prop.beds} label="سرير" />
            <Spec n={prop.bathrooms} label="حمام" />
          </div>

          <div className="mt-4">
            <ShareProperty id={prop.id} title={prop.title} />
          </div>

          {prop.utilities_paid_by_guest && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 shrink-0">
                <path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span>
                <span className="font-bold">الكهرباء والمياه تُدفع بشكل منفصل</span> بواسطة الضيف في العقار (شحن الكارت
                مسبق الدفع عند الوصول أو خصمها من تأمين الأضرار عند المغادرة).
              </span>
            </div>
          )}

          <p className="mt-5 whitespace-pre-line leading-8 text-black/75">{prop.description}</p>

          {prop.amenities.length > 0 && (
            <>
              <h2 className="mt-6 mb-3 font-bold">المرافق</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {prop.amenities.map((a) => (
                  <span key={a.id} className="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-sm text-black/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {a.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Access & gate (Egypt gated-compound logistics) */}
          <h2 className="mt-6 mb-3 font-bold">الدخول والبوابة</h2>
          <div className="rounded-2xl border border-brand/[0.07] bg-white p-4 text-sm">
            <p className="text-black/70">
              وايلد ديكسي بتتولّى تصريح البوابة لكل ضيف — بنسجّل رقمك القومي ولوحة عربيتك ونصدر التصريح قبل وصولك، عشان تدخل من غير أي تعطيل.
            </p>
            <ul className="mt-3 space-y-2 text-black/65">
              {prop.resort?.gate_app && (
                <AccessRow label="تطبيق البوابة" value={prop.resort.gate_app} />
              )}
              {prop.resort?.beach_code_required && (
                <AccessRow label="كود الشاطئ" value="بنوفّره مع تصريح الدخول" />
              )}
              <AccessRow label="رسوم تصريح البوابة" value={prop.resort && Number(prop.resort.pass_fee) > 0 ? `${egp(prop.resort.pass_fee)} (تُحصّل من الضيف)` : "حسب الكمبوند"} />
              <AccessRow label="مطلوب من الضيف" value="رقم قومي + لوحة السيارة" />
            </ul>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-20 p-5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{egp(prop.base_price_per_night)}</span>
              <span className="text-sm text-black/50">/ الليلة</span>
            </div>
            {priceQuote?.instant_book ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5L13 2Z"/></svg>
                حجز فوري
              </span>
            ) : (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                يحتاج موافقة المالك
              </span>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-black/50">
                الوصول
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input mt-1" />
              </label>
              <label className="text-xs font-medium text-black/50">
                المغادرة
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input mt-1" />
              </label>
            </div>
            <label className="mt-3 block text-xs font-medium text-black/50">
              عدد الضيوف
              <input type="number" min={1} max={prop.max_guests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input mt-1" />
            </label>
            <label className="mt-3 block text-xs font-medium text-black/50">
              رقم لوحة السيارة <span className="text-black/35">(لتصريح بوابة الكمبوند)</span>
              <input value={carPlate} onChange={(e) => setCarPlate(e.target.value)} placeholder="مثال: س ص ع 1234" className="input mt-1" />
            </label>

            {canDeposit && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl bg-brand-light/60 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={isDeposit} onChange={(e) => setIsDeposit(e.target.checked)} className="accent-brand" />
                ادفع عربون {prop.down_payment_percentage}% فقط الآن
              </label>
            )}

            {priceQuote && (
              <div className="mt-4 space-y-1.5 border-t border-black/[0.07] pt-4 text-sm fade-up">
                {/* Per-night breakdown if mixed rates */}
                {priceQuote.nights_breakdown.length > 0 && (() => {
                  const prices = [...new Set(priceQuote.nights_breakdown.map((n) => n.price))];
                  if (prices.length > 1) return (
                    <div className="mb-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-black/60 space-y-0.5">
                      {priceQuote.nights_breakdown.map((n) => (
                        <div key={n.date} className="flex justify-between">
                          <span>{new Date(n.date).toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" })}</span>
                          <span className="font-medium">{egp(n.price)}</span>
                        </div>
                      ))}
                    </div>
                  );
                  return null;
                })()}
                <Row label={`${priceQuote.nights} ليالٍ`} value={egp(priceQuote.subtotal)} />
                {priceQuote.discount_percent > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                      خصم {priceQuote.discount_percent}%
                    </span>
                    <span>-{egp(priceQuote.discount_amount)}</span>
                  </div>
                )}
                <Row label="رسوم نظافة" value={egp(priceQuote.cleaning_fee)} muted />
                {quote && (
                  <div className="rounded-lg bg-aqua/10 px-3 py-2">
                    <div className="flex items-center justify-between font-medium text-aqua">
                      <span>تأمين الأضرار</span>
                      <span>{egp(quote.security_deposit)}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-aqua/80">يُرد بالكامل بعد المغادرة لو مفيش أضرار.</p>
                  </div>
                )}
                <div className="my-2 border-t border-black/[0.07]" />
                <Row label="إجمالي الحجز" value={egp(quote?.total_amount ?? priceQuote.total)} bold />
                {quote?.is_deposit && (
                  <Row label={`العربون (${quote.down_payment_percentage}%)`} value={egp(quote.down_payment_amount)} muted />
                )}
                <div className="flex items-center justify-between rounded-lg bg-gold-light px-3 py-2 font-bold text-gold-dark">
                  <span>المطلوب الآن</span>
                  <span>{egp(quote?.amount_due_now ?? priceQuote.total)}</span>
                </div>
                {quote && Number(quote.balance_due_later) > 0 && (
                  <p className="text-xs text-black/50">الباقي {egp(quote.balance_due_later)} عند الوصول.</p>
                )}
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

            <button onClick={book} disabled={!priceQuote || busy} className="btn-primary mt-4 w-full disabled:opacity-50">
              {busy ? "جارٍ الحجز…" : user ? "احجز الآن" : "سجّل دخول للحجز"}
            </button>
            <p className="mt-2.5 text-center text-xs text-black/40">🔒 مطلوب الرقم القومي للحجز</p>
            <p className="mt-2 rounded-lg bg-coral-light px-3 py-2 text-center text-xs font-medium text-coral-dark">
              الإلغاء قبل أقل من ٧ أيام من الوصول يخسّر ١٠٠٪ من المبلغ المدفوع.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold">{n}</div>
      <div className="text-xs text-black/50">{label}</div>
    </div>
  );
}

function AccessRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start justify-between gap-3 border-t border-brand/[0.06] pt-2 first:border-0 first:pt-0">
      <span className="text-black/50">{label}</span>
      <span className="text-left font-medium text-black/75">{value}</span>
    </li>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-black/50" : ""} ${bold ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
