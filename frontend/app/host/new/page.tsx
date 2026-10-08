"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Amenity, ImportedListing, PropertyType, Resort } from "@/lib/types";

const TYPES: { v: PropertyType; l: string; d: string }[] = [
  { v: "chalet", l: "شاليه", d: "وحدة مطلة على البحر في كمبوند ساحلي" },
  { v: "villa", l: "فيلا", d: "بيت مستقل بحديقة أو مساحة خاصة" },
  { v: "apartment", l: "شقة", d: "وحدة داخل مبنى سكني" },
  { v: "studio", l: "استوديو", d: "مساحة واحدة مفتوحة، مناسبة لضيوف قليلين" },
  { v: "cabin", l: "كابينة", d: "وحدة صغيرة مستقلة، غالبًا للجبال أو الريف" },
  { v: "room", l: "غرفة", d: "غرفة خاصة داخل وحدة أكبر" },
];

const empty = {
  title: "",
  description: "",
  property_type: "" as PropertyType | "",
  listing_type: "" as "self_list" | "managed" | "",
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

const STEPS = [
  "نوع العقار",
  "طريقة الإدارة",
  "الموقع",
  "التفاصيل",
  "العنوان والوصف",
  "الصور",
  "المرافق",
  "السعر",
  "المراجعة والتفويض",
] as const;

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
  const [step, setStep] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
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

  const canNext = (() => {
    switch (step) {
      case 0: return !!form.property_type;
      case 1: return !!form.listing_type;
      case 2: return !!form.area.trim();
      case 3: return true;
      case 4: return form.title.trim().length >= 4;
      case 5: return true;
      case 6: return true;
      case 7: return !!form.base_price_per_night;
      default: return true;
    }
  })();

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrlInput("");
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

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
      const r = await api.createResort({ name, area: form.area || "Ain Sokhna" });
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
    <div className="mx-auto max-w-2xl">
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-8 bg-brand" : i < step ? "w-1.5 bg-brand/50" : "w-1.5 bg-black/10"
            }`}
          />
        ))}
      </div>

      {fromImport && step === 0 && (
        <p className="mb-5 rounded-xl bg-brand-light/50 px-4 py-2.5 text-center text-sm text-brand">
          تم ملء بعض البيانات من Airbnb — راجعها في كل خطوة.
        </p>
      )}

      <div className="min-h-[420px]">
        {step === 0 && (
          <StepShell title="إيه نوع العقار؟">
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPES.map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => set("property_type", t.v)}
                  className={`rounded-2xl border-2 p-5 text-right transition ${
                    form.property_type === t.v ? "border-brand bg-brand-light/40" : "border-black/10 bg-white hover:border-brand/30"
                  }`}
                >
                  <p className="text-lg font-bold text-black/85">{t.l}</p>
                  <p className="mt-1 text-sm text-black/50">{t.d}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="مين هيدير الحجوزات؟">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => set("listing_type", "self_list")}
                className={`w-full rounded-2xl border-2 p-5 text-right transition ${
                  form.listing_type === "self_list" ? "border-brand bg-brand-light/40" : "border-black/10 bg-white hover:border-brand/30"
                }`}
              >
                <p className="text-lg font-bold text-brand">اعرض بنفسك</p>
                <p className="mt-1 text-sm text-black/55">انت بتدير الضيوف والتأجير بنفسك — عمولة ١٠٪ على الحجز بس.</p>
              </button>
              <button
                type="button"
                onClick={() => set("listing_type", "managed")}
                className={`w-full rounded-2xl border-2 p-5 text-right transition ${
                  form.listing_type === "managed" ? "border-gold bg-gold/10" : "border-black/10 bg-white hover:border-gold/40"
                }`}
              >
                <p className="text-lg font-bold text-amber-800">مُدارة بالكامل من وايلد ديكسي</p>
                <p className="mt-1 text-sm text-black/55">إحنا بندير كل حاجة — تختار باكدج من ١٥٪ لـ٢٨٪.</p>
              </button>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="فين موقع العقار؟">
            <div className="space-y-4">
              <Field label="المنطقة">
                <input className="input" placeholder="مثلاً: العين السخنة" value={form.area} onChange={(e) => set("area", e.target.value)} />
              </Field>
              <Field label="القرية / الكمبوند (اختياري)">
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
              {form.resort_id === "__new__" && (
                <div className="flex gap-2 rounded-xl bg-brand-light/40 p-3">
                  <input
                    className="input"
                    placeholder="اكتب اسم القرية / الكمبوند"
                    value={customResort}
                    onChange={(e) => setCustomResort(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomResort(); } }}
                  />
                  <button type="button" onClick={addCustomResort} className="btn-primary whitespace-nowrap">إضافة</button>
                </div>
              )}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="كام غرفة وسرير؟">
            <div className="grid grid-cols-2 gap-4">
              <Stepper label="ضيوف" v={form.max_guests} min={1} on={(n) => set("max_guests", n)} />
              <Stepper label="غرف نوم" v={form.bedrooms} min={0} on={(n) => set("bedrooms", n)} />
              <Stepper label="أسرّة" v={form.beds} min={0} on={(n) => set("beds", n)} />
              <Stepper label="حمامات" v={form.bathrooms} min={0} on={(n) => set("bathrooms", n)} />
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="اكتب عنوان ووصف جذّاب">
            <div className="space-y-4">
              <Field label="عنوان العقار">
                <input className="input" placeholder="مثلاً: شاليه إطلالة بحر مباشرة — العين السخنة" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="الوصف">
                <textarea className="input min-h-40" placeholder="اوصف الوحدة، الإطلالة، وأي حاجة تميّزها…" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="ضيف صور الوحدة">
            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {images.map((src, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                      {i === 0 && <span className="absolute bottom-1 right-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-brand-dark">غلاف</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="input ltr:text-left"
                  dir="ltr"
                  placeholder="الصق رابط صورة"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                />
                <button type="button" onClick={addImageUrl} className="btn-outline whitespace-nowrap">+ إضافة</button>
              </div>
              <p className="text-xs text-black/40">أول صورة تتضاف بتبقى غلاف الإعلان — رتّبها بحذف وإعادة إضافة لو عايز تغيّر الترتيب.</p>
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="إيه المرافق المتاحة؟">
            <div className="space-y-4">
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
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="أضف مرفق مش موجود (مثلاً: جاكوزي، بلايستيشن…)"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                />
                <button type="button" onClick={addCustomAmenity} className="btn-outline whitespace-nowrap">+ إضافة</button>
              </div>
            </div>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="حدّد سعرك">
            <div className="space-y-4">
              <Field label="السعر / ليلة (ج.م)">
                <input className="input text-lg font-bold" type="number" value={form.base_price_per_night} onChange={(e) => set("base_price_per_night", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
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
              <label className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <input type="checkbox" checked={form.utilities_paid_by_guest} onChange={(e) => set("utilities_paid_by_guest", e.target.checked)} className="accent-amber-600" />
                الكهرباء والمياه يدفعها الضيف بشكل منفصل (سياسة إلزامية)
              </label>
            </div>
          </StepShell>
        )}

        {step === 8 && (
          <StepShell title="آخر خطوة — التفويض والمراجعة">
            <div className="space-y-4">
              <div className="card space-y-1.5 p-4 text-sm">
                <p><b>{form.title || "—"}</b></p>
                <p className="text-black/50">{TYPES.find((t) => t.v === form.property_type)?.l} · {form.area || "—"}</p>
                <p className="text-black/50">{form.max_guests} ضيوف · {form.bedrooms} غرف · {images.length} صورة</p>
                <p className="font-bold text-brand">{form.base_price_per_night || "—"} ج.م / ليلة</p>
              </div>

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
          </StepShell>
        )}
      </div>

      {step < STEPS.length - 1 && (
        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-0">
            رجوع
          </button>
          <button type="button" onClick={next} disabled={!canNext} className="btn-primary px-8 disabled:opacity-40">
            متابعة
          </button>
        </div>
      )}
      {step === STEPS.length - 1 && (
        <div className="mt-6">
          <button type="button" onClick={back} className="btn-outline">رجوع</button>
        </div>
      )}
    </div>
  );
}

function StepShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold text-black/85">{title}</h1>
      {children}
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

function Stepper({ label, v, min, on }: { label: string; v: number; min: number; on: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
      <span className="font-medium text-black/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => on(Math.max(min, v - 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-black/15 text-lg leading-none hover:bg-black/5"
        >
          −
        </button>
        <span className="w-6 text-center font-bold">{v}</span>
        <button
          type="button"
          onClick={() => on(v + 1)}
          className="grid h-8 w-8 place-items-center rounded-full border border-black/15 text-lg leading-none hover:bg-black/5"
        >
          +
        </button>
      </div>
    </div>
  );
}
