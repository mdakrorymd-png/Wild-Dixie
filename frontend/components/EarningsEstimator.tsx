"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getAttribution } from "@/lib/attribution";

const COMPOUNDS = ["Azha", "La Vista", "Malibu", "Porto Sokhna", "Telal Sokhna", "Stella Di Mare", "أخرى"];
const BASE_ADR: Record<number, number> = { 1: 3000, 2: 4500, 3: 6500, 4: 9000 };
const SEASON: { id: string; label: string; mult: number; nights: number }[] = [
  { id: "off", label: "شتاء (هادئ)", mult: 0.55, nights: 9 },
  { id: "shoulder", label: "ربيع / خريف", mult: 1.0, nights: 12 },
  { id: "peak", label: "صيف (ذروة)", mult: 1.8, nights: 20 },
];
const COMMISSION = 0.2;

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n / 1000) * 1000);
}

export function EarningsEstimator() {
  const [compound, setCompound] = useState(COMPOUNDS[0]);
  const [bedrooms, setBedrooms] = useState(2);
  const [season, setSeason] = useState("shoulder");
  const [pool, setPool] = useState(true);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const est = useMemo(() => {
    const s = SEASON.find((x) => x.id === season)!;
    const adr = (BASE_ADR[bedrooms] ?? BASE_ADR[4]) * (pool ? 1.3 : 1) * s.mult;
    const gross = adr * s.nights;
    const net = gross * (1 - COMMISSION);
    return { grossLo: gross * 0.9, grossHi: gross * 1.1, net, nights: s.nights };
  }, [bedrooms, season, pool]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createLead({
        kind: "owner_estimate",
        full_name: name || undefined,
        whatsapp: whatsapp || undefined,
        area: "Ain Sokhna",
        compound,
        bedrooms,
        season,
        has_pool: pool,
        estimated_gross: Math.round(est.grossHi),
        estimated_net: Math.round(est.net),
        source: JSON.stringify(getAttribution()),
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 rounded-3xl border border-brand/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-black/55">الكمبوند (العين السخنة)</label>
          <select className="input" value={compound} onChange={(e) => setCompound(e.target.value)}>
            {COMPOUNDS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-black/55">عدد الغرف</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBedrooms(b)}
                className={`rounded-xl border py-2 text-sm transition ${
                  bedrooms === b ? "border-gold bg-gold-light font-bold text-brand" : "border-brand/15"
                }`}
              >
                {b === 4 ? "+4" : b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-black/55">الموسم</label>
          <div className="grid grid-cols-3 gap-2">
            {SEASON.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeason(s.id)}
                className={`rounded-xl border py-2 text-xs transition ${
                  season === s.id ? "border-gold bg-gold-light font-bold text-brand" : "border-brand/15"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand-light px-3 py-2.5 text-sm">
          <input type="checkbox" checked={pool} onChange={(e) => setPool(e.target.checked)} className="accent-gold" />
          حمام سباحة خاص
        </label>
      </div>

      {/* Result + lead */}
      <div className="flex flex-col justify-between rounded-2xl bg-brand p-5 text-white">
        {sent ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gold text-brand-dark text-2xl">✓</div>
            <p className="text-lg font-bold">وصلنا طلبك!</p>
            <p className="mt-1 text-sm text-white/75">فريق وايلد ديكسي هيتواصل معاك على واتساب في أسرع وقت.</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-white/60">الدخل الشهري المتوقّع</p>
              <p className="text-3xl font-bold text-gold">
                <bdi dir="ltr">{fmt(est.grossLo)}–{fmt(est.grossHi)}</bdi> <span className="text-base font-normal text-white/70">ج.م</span>
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">نصيبك بعد عمولة ٢٠٪</span>
                  <span className="font-bold">~{fmt(est.net)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">ليالٍ بنفتحها لك شهريًا</span>
                  <span className="font-bold">~{est.nights}</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/45">تقدير مبدئي من بيانات السوق — الرقم النهائي بعد معاينة وحدتك.</p>
            </div>
            <form onSubmit={submit} className="mt-4 space-y-2">
              <input className="input bg-white/95 text-brand" placeholder="اسمك" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input bg-white/95 text-brand" type="tel" inputMode="tel" placeholder="رقم الواتساب" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
              <button className="btn-primary w-full" disabled={busy}>
                {busy ? "..." : "احجز استشارة مجانية"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
