"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Amenity, ImportedListing, PropertyType, Resort } from "@/lib/types";

const TYPES: { v: PropertyType; l: string }[] = [
  { v: "chalet", l: "شاليه" },
  { v: "villa", l: "فيلا" },
  { v: "apartment", l: "شقة" },
  { v: "studio", l: "استوديو" },
  { v: "cabin", l: "كابينة" },
  { v: "room", l: "غرفة" },
];

const empty = {
  title: "",
  description: "",
  property_type: "chalet" as PropertyType,
  area: "",
  resort_id: "",
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  base_price_per_night: "",
  cleaning_fee: "0",
  security_deposit: "",
  down_payment_percentage: 25,
  min_nights: 1,
  utilities_paid_by_guest: true,
};

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fromImport, setFromImport] = useState<string | null>(null);
  const [authGate, setAuthGate] = useState(false);
  const [authKeys, setAuthKeys] = useState(false);

  useEffect(() => {
    api.resorts().then(setResorts).catch(() => undefined);
    api.amenities().then(setAmenities).catch(() => undefined);

    const raw = sessionStorage.getItem("import_prefill");
    if (raw) {
      try {
        const d: ImportedListing = JSON.parse(raw);
        setForm((f) => ({
          ...f,
          title: d.title ?? "",
          description: d.description ?? "",
          max_guests: d.max_guests ?? f.max_guests,
          bedrooms: d.bedrooms ?? f.bedrooms,
          beds: d.beds ?? f.beds,
          bathrooms: d.bathrooms ?? f.bathrooms,
        }));
        setImages(d.images.slice(0, 20));
        setFromImport(d.source_url);
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem("import_prefill");
    }
  }, []);

  if (loading) return <p className="text-black/50">…</p>;
  if (!user?.roles.includes("host"))
    return <p className="text-black/50">فعّل حساب المضيف أولاً من صفحة الملف الشخصي.</p>;

  const set = (k: keyof typeof empty, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  async function submit(sendForReview: boolean) {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        ...form,
        resort_id: form.resort_id || null,
        base_price_per_night: Number(form.base_price_per_night),
        cleaning_fee: Number(form.cleaning_fee || 0),
        security_deposit: Number(form.security_deposit || 0),
        amenity_ids: Array.from(picked),
        images: images.map((url, i) => ({ url, position: i, is_cover: i === 0 })),
      };
      const created = await api.createProperty(body);
      if (sendForReview && images.length > 0) {
        await api.submitProperty(created.id);
      }
      router.push("/host");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold">معالج إضافة عقار</h1>
      {fromImport ? (
        <p className="mb-5 text-sm text-brand">تم ملء البيانات من Airbnb — راجِعها وأضِف السعر بالجنيه.</p>
      ) : (
        <p className="mb-5 text-sm text-black/50">أدخل بيانات عقارك، أو استورده من Airbnb من لوحة المضيف.</p>
      )}

      {images.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
          {images.slice(0, 8).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="h-24 w-32 shrink-0 rounded-lg object-cover" />
          ))}
          {images.length > 8 && (
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-black/5 text-sm text-black/50">
              +{images.length - 8}
            </div>
          )}
        </div>
      )}

      <div className="card space-y-4 p-5">
        <Field label="عنوان العقار">
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="الوصف">
          <textarea className="input min-h-24" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="النوع">
            <select className="input" value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.v} value={t.v}>{t.l}</option>
              ))}
            </select>
          </Field>
          <Field label="المنطقة">
            <input className="input" placeholder="الساحل الشمالي" value={form.area} onChange={(e) => set("area", e.target.value)} />
          </Field>
          <Field label="القرية / الريزورت">
            <select className="input" value={form.resort_id} onChange={(e) => set("resort_id", e.target.value)}>
              <option value="">— اختر —</option>
              {resorts.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Num label="ضيوف" v={form.max_guests} on={(n) => set("max_guests", n)} />
          <Num label="غرف نوم" v={form.bedrooms} on={(n) => set("bedrooms", n)} />
          <Num label="أسرّة" v={form.beds} on={(n) => set("beds", n)} />
          <Num label="حمامات" v={form.bathrooms} on={(n) => set("bathrooms", n)} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="السعر / ليلة (ج.م)">
            <input className="input" type="number" value={form.base_price_per_night} onChange={(e) => set("base_price_per_night", e.target.value)} />
          </Field>
          <Field label="رسوم نظافة">
            <input className="input" type="number" value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", e.target.value)} />
          </Field>
          <Field label="تأمين الأضرار">
            <input className="input" type="number" value={form.security_deposit} onChange={(e) => set("security_deposit", e.target.value)} />
          </Field>
          <Field label="عربون %">
            <input className="input" type="number" min={0} max={100} value={form.down_payment_percentage} onChange={(e) => set("down_payment_percentage", Number(e.target.value))} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-black/50">المرافق</p>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={`chip ${picked.has(a.id) ? "border-brand bg-brand text-white" : "border-black/10 bg-white text-black/60"}`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <input type="checkbox" checked={form.utilities_paid_by_guest} onChange={(e) => set("utilities_paid_by_guest", e.target.checked)} className="accent-amber-600" />
          الكهرباء والمياه يدفعها الضيف بشكل منفصل (سياسة إلزامية)
        </label>

        {/* Owner onboarding / authorization */}
        <div className="rounded-xl border border-brand/10 bg-brand-light/40 p-4">
          <p className="mb-2 text-sm font-bold text-brand">تفويض الإدارة</p>
          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={authGate} onChange={(e) => setAuthGate(e.target.checked)} className="mt-0.5 accent-brand" />
              <span>أفوّض وايلد ديكسي بإدارة تطبيق البوابة وإصدار تصاريح الضيوف نيابةً عني.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={authKeys} onChange={(e) => setAuthKeys(e.target.checked)} className="mt-0.5 accent-brand" />
              <span>أوافق على تسليم مفتاح الوحدة للفريق الموثّق مع توثيق كل تسليم/استلام.</span>
            </label>
          </div>
          {!user?.national_id && (
            <p className="mt-2 text-xs text-coral-dark">
              لإكمال التوثيق، أضف رقمك القومي من{" "}
              <a href="/profile" className="underline">الملف الشخصي</a>.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button onClick={() => submit(true)} disabled={busy || !authGate || !authKeys} className="btn-primary flex-1 disabled:opacity-50">
            {busy ? "…" : "حفظ وإرسال للمراجعة"}
          </button>
          <button onClick={() => submit(false)} disabled={busy} className="btn-outline">
            حفظ كمسودة
          </button>
        </div>
        {(!authGate || !authKeys) && (
          <p className="text-center text-xs text-black/40">لازم توافق على بندي التفويض عشان تبعت للمراجعة.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/50">{label}</span>
      {children}
    </label>
  );
}

function Num({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <Field label={label}>
      <input className="input" type="number" min={0} value={v} onChange={(e) => on(Number(e.target.value))} />
    </Field>
  );
}
