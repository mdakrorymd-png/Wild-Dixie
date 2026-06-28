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
  listing_type: "self_list" as "self_list" | "managed",
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
  const [customResort, setCustomResort] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [importedAmenities, setImportedAmenities] = useState<string[]>([]);

  useEffect(() => {
    // Only the Suez corridor (Ain Sokhna -> Zaafarana), alphabetical from the API.
    api.resorts({ governorate: "Suez" }).then(setResorts).catch(() => undefined);
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
        setImportedAmenities(d.amenities ?? []);
        setFromImport(d.source_url);
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem("import_prefill");
    }
  }, []);

  // Pre-select catalog amenities that match the ones imported from Airbnb.
  useEffect(() => {
    if (!amenities.length || !importedAmenities.length) return;
    const want = new Set(importedAmenities.map((n) => n.toLowerCase()));
    const ids = amenities.filter((a) => want.has(a.name.toLowerCase())).map((a) => a.id);
    if (ids.length) setPicked(new Set(ids));
  }, [amenities, importedAmenities]);

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
        resort_id: form.resort_id && form.resort_id !== "__new__" ? form.resort_id : null,
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

  async function addCustomResort() {
    const name = customResort.trim();
    if (!name) return;
    try {
      const r = await api.createResort({ name, area: "Ain Sokhna" });
      setResorts((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]));
      set("resort_id", r.id);
      setCustomResort("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر إضافة القرية");
    }
  }

  async function addCustomAmenity() {
    const name = customAmenity.trim();
    if (!name) return;
    try {
      const a = await api.createAmenity({ name });
      setAmenities((prev) => (prev.some((x) => x.id === a.id) ? prev : [...prev, a]));
      setPicked((prev) => new Set(prev).add(a.id));
      setCustomAmenity("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر إضافة المرفق");
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

        <div className="rounded-xl border border-brand/15 bg-brand-light/30 p-4">
          <p className="mb-2 text-sm font-semibold text-brand">نوع الإدارة</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.listing_type === "self_list" ? "border-brand bg-brand/5" : "border-black/10 bg-white"}`}>
              <input type="radio" name="listing_type" value="self_list" checked={form.listing_type === "self_list"} onChange={() => set("listing_type", "self_list")} className="mt-0.5 accent-brand" />
              <div>
                <p className="font-semibold text-brand">اعرض بنفسك</p>
                <p className="mt-0.5 text-xs text-black/55">انت بتدير الضيوف والتأجير — عمولة ١٠٪ على الحجز بس.</p>
              </div>
            </label>
            <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.listing_type === "managed" ? "border-gold bg-gold/5" : "border-black/10 bg-white"}`}>
              <input type="radio" name="listing_type" value="managed" checked={form.listing_type === "managed"} onChange={() => set("listing_type", "managed")} className="mt-0.5 accent-amber-500" />
              <div>
                <p className="font-semibold text-amber-800">مُدارة بالكامل من وايلد ديكسي</p>
                <p className="mt-0.5 text-xs text-black/55">وايلد ديكسي بتدير كل حاجة — تختار باكدج من ١٥٪ لـ٢٨٪.</p>
              </div>
            </label>
          </div>
        </div>

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
          <Field label="القرية / الكمبوند">
            <select className="input" value={form.resort_id} onChange={(e) => set("resort_id", e.target.value)}>
              <option value="">— اختر —</option>
              {[...resorts]
                .sort((a, b) => (a.name_ar ?? a.name).localeCompare(b.name_ar ?? b.name, "ar"))
                .map((r) => (
                  <option key={r.id} value={r.id}>{r.name_ar ?? r.name}</option>
                ))}
              <option value="__new__">+ قريتي مش في القائمة…</option>
            </select>
          </Field>
        </div>

        {form.resort_id === "__new__" && (
          <div className="flex gap-2 rounded-xl bg-brand-light/40 p-3">
            <input
              className="input"
              placeholder="اكتب اسم القرية / الكمبوند"
              value={customResort}
              onChange={(e) => setCustomResort(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomResort(); } }}
            />
            <button type="button" onClick={addCustomResort} className="btn-primary whitespace-nowrap">إضافة القرية</button>
          </div>
        )}

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
          <p className="mb-2 text-xs font-medium text-black/50">المرافق — اضغط للإضافة/الإزالة، أو أضف مرفق مش موجود</p>
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
          <div className="mt-3 flex gap-2">
            <input
              className="input"
              placeholder="أضف مرفق (مثلاً: جاكوزي، بلايستيشن…)"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
            />
            <button type="button" onClick={addCustomAmenity} className="btn-outline whitespace-nowrap">+ إضافة</button>
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
