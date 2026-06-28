"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PricingSettings, PriceRule, PriceRuleCreate, Property } from "@/lib/types";
import Navbar from "@/components/Navbar";

const EGP = (v: string | number | null | undefined) =>
  v != null ? `${Number(v).toLocaleString("ar-EG")} ج.م` : "—";

function DiscountBadge({ pct }: { pct: number }) {
  if (!pct) return <span className="text-xs text-black/30">لا يوجد</span>;
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{pct}% خصم</span>;
}

interface FieldProps {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  min?: number;
  max?: number;
}
function Field({ label, sub, value, onChange, type = "number", suffix, min, max }: FieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-black/80">{label}</div>
        {sub && <div className="text-xs text-black/40 mt-0.5">{sub}</div>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className="w-28 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-right text-sm font-medium focus:border-brand focus:outline-none"
        />
        {suffix && <span className="text-xs text-black/50 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

export default function HostPricingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // rule form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState<PriceRuleCreate>({
    label: "", start_date: "", end_date: "", price_per_night: 0, priority: 0,
  });
  const [addingRule, setAddingRule] = useState(false);

  // local editable state
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    api.myProperties().then((p) => {
      setProperties(p.items);
      const fromUrl = params.get("id");
      const first = fromUrl && p.items.find((x) => x.id === fromUrl) ? fromUrl : p.items[0]?.id ?? "";
      setSelectedId(first);
    }).catch(() => router.push("/login"));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setSettings(null);
    api.getPricingSettings(selectedId).then((s) => {
      setSettings(s);
      setForm({
        base_price_per_night: s.base_price_per_night,
        weekend_price_per_night: s.weekend_price_per_night ?? "",
        cleaning_fee: s.cleaning_fee,
        security_deposit: s.security_deposit,
        weekly_discount: String(s.weekly_discount),
        monthly_discount: String(s.monthly_discount),
        early_bird_discount: String(s.early_bird_discount),
        early_bird_days: String(s.early_bird_days),
        last_minute_discount: String(s.last_minute_discount),
        last_minute_days: String(s.last_minute_days),
        min_nights: String(s.min_nights),
        max_nights: s.max_nights ? String(s.max_nights) : "",
        down_payment_percentage: String(s.down_payment_percentage),
        instant_book: s.instant_book ? "1" : "0",
      });
    });
  }, [selectedId]);

  const f = (key: string) => form[key] ?? "";
  const set = (key: string) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const body: Record<string, unknown> = {
        base_price_per_night: Number(f("base_price_per_night")) || undefined,
        weekend_price_per_night: f("weekend_price_per_night") ? Number(f("weekend_price_per_night")) : null,
        cleaning_fee: Number(f("cleaning_fee")),
        security_deposit: Number(f("security_deposit")),
        weekly_discount: Number(f("weekly_discount")),
        monthly_discount: Number(f("monthly_discount")),
        early_bird_discount: Number(f("early_bird_discount")),
        early_bird_days: Number(f("early_bird_days")) || 30,
        last_minute_discount: Number(f("last_minute_discount")),
        last_minute_days: Number(f("last_minute_days")) || 7,
        min_nights: Number(f("min_nights")) || 1,
        max_nights: f("max_nights") ? Number(f("max_nights")) : null,
        down_payment_percentage: Number(f("down_payment_percentage")),
        instant_book: f("instant_book") === "1",
      };
      const updated = await api.updatePricingSettings(selectedId, body);
      setSettings(updated);
      setMsg({ ok: true, text: "تم حفظ إعدادات التسعير ✓" });
    } catch (e: unknown) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function addRule() {
    setAddingRule(true);
    try {
      const rule = await api.createPriceRule(selectedId, ruleForm);
      setSettings((s) => s ? { ...s, price_rules: [...s.price_rules, rule] } : s);
      setShowRuleForm(false);
      setRuleForm({ label: "", start_date: "", end_date: "", price_per_night: 0, priority: 0 });
    } catch (e: unknown) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setAddingRule(false);
    }
  }

  async function deleteRule(ruleId: string) {
    await api.deletePriceRule(selectedId, ruleId);
    setSettings((s) => s ? { ...s, price_rules: s.price_rules.filter((r) => r.id !== ruleId) } : s);
  }

  const prop = properties.find((p) => p.id === selectedId);

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-brand">إعدادات التسعير</h1>
        <p className="mb-6 text-sm text-black/50">تحكم في أسعار وحدتك، الخصومات، والتقويم — مثل Airbnb تماماً</p>

        {/* Property selector */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mb-6 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        {!settings ? (
          <div className="py-16 text-center text-sm text-black/30">جاري التحميل...</div>
        ) : (
          <>
            {/* ---- Base pricing ---- */}
            <section className="mb-4 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-brand">الأسعار الأساسية</h2>
              <p className="mb-3 text-xs text-black/40">السعر الأساسي يُطبَّق على كل الأيام ما لم يوجد سعر خاص</p>
              <div className="divide-y divide-black/5">
                <Field label="السعر / ليلة" sub="أيام الأسبوع (الأحد – الأربعاء)" value={f("base_price_per_night")} onChange={set("base_price_per_night")} suffix="ج.م" min={0} />
                <Field
                  label="سعر عطلة نهاية الأسبوع"
                  sub="الخميس + الجمعة + السبت — اتركه فارغاً لنفس السعر"
                  value={f("weekend_price_per_night")}
                  onChange={set("weekend_price_per_night")}
                  suffix="ج.م"
                  min={0}
                />
                <Field label="رسوم التنظيف" sub="تُضاف مرة واحدة لكل حجز" value={f("cleaning_fee")} onChange={set("cleaning_fee")} suffix="ج.م" min={0} />
                <Field label="تأمين ضد الأضرار" sub="يُسترد بعد انتهاء الإقامة" value={f("security_deposit")} onChange={set("security_deposit")} suffix="ج.م" min={0} />
                <Field label="عربون (دفعة مقدمة)" sub="0 = الدفع كامل فوراً" value={f("down_payment_percentage")} onChange={set("down_payment_percentage")} suffix="%" min={0} max={100} />
              </div>
            </section>

            {/* ---- Stay length discounts ---- */}
            <section className="mb-4 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-brand">خصومات مدة الإقامة</h2>
              <p className="mb-3 text-xs text-black/40">كلما طالت الإقامة، كلما زاد الخصم — يجذب حجوزات الشهور الكاملة</p>
              <div className="divide-y divide-black/5">
                <Field label="خصم أسبوعي (٧+ ليالٍ)" value={f("weekly_discount")} onChange={set("weekly_discount")} suffix="%" min={0} max={80} />
                <Field label="خصم شهري (٢٨+ ليلة)" value={f("monthly_discount")} onChange={set("monthly_discount")} suffix="%" min={0} max={80} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-3">
                <div className="text-center">
                  <div className="text-xs text-black/40 mb-1">أسبوعي</div>
                  <DiscountBadge pct={Number(f("weekly_discount"))} />
                </div>
                <div className="text-center">
                  <div className="text-xs text-black/40 mb-1">شهري</div>
                  <DiscountBadge pct={Number(f("monthly_discount"))} />
                </div>
              </div>
            </section>

            {/* ---- Time-based discounts ---- */}
            <section className="mb-4 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-brand">خصومات الحجز المبكر والأخير</h2>
              <p className="mb-3 text-xs text-black/40">شجّع الحجز المبكر أو امتص الفراغ في اللحظة الأخيرة</p>
              <div className="divide-y divide-black/5">
                <Field label="خصم الحجز المبكر" sub="للحجوزات قبل الموعد بـ N يوم" value={f("early_bird_discount")} onChange={set("early_bird_discount")} suffix="%" min={0} max={50} />
                <Field label="عدد الأيام (مبكر)" value={f("early_bird_days")} onChange={set("early_bird_days")} suffix="يوم" min={1} max={365} />
                <Field label="خصم اللحظة الأخيرة" sub="للحجوزات خلال N يوم من الموعد" value={f("last_minute_discount")} onChange={set("last_minute_discount")} suffix="%" min={0} max={50} />
                <Field label="عدد الأيام (آخر لحظة)" value={f("last_minute_days")} onChange={set("last_minute_days")} suffix="يوم" min={1} max={30} />
              </div>
            </section>

            {/* ---- Booking rules ---- */}
            <section className="mb-4 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-brand">قواعد الحجز</h2>
              <div className="divide-y divide-black/5">
                <Field label="الحد الأدنى للإقامة" value={f("min_nights")} onChange={set("min_nights")} suffix="ليلة" min={1} max={365} />
                <Field label="الحد الأقصى للإقامة" sub="اتركه فارغاً بلا حد أقصى" value={f("max_nights")} onChange={set("max_nights")} suffix="ليلة" min={1} max={365} />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-black/80">الحجز الفوري</div>
                    <div className="text-xs text-black/40">بدون موافقة يدوية منك</div>
                  </div>
                  <button
                    onClick={() => set("instant_book")(f("instant_book") === "1" ? "0" : "1")}
                    className={`relative h-6 w-11 rounded-full transition-colors ${f("instant_book") === "1" ? "bg-brand" : "bg-black/20"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${f("instant_book") === "1" ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* ---- Seasonal rules ---- */}
            <section className="mb-6 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-brand">أسعار الفترات الخاصة</h2>
                  <p className="text-xs text-black/40">عيد الأضحى، رمضان، الصيف، إلخ — تأخذ الأولوية على السعر الأساسي</p>
                </div>
                <button
                  onClick={() => setShowRuleForm(!showRuleForm)}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white"
                >
                  + أضف فترة
                </button>
              </div>

              {showRuleForm && (
                <div className="mb-4 rounded-xl border border-brand/20 bg-brand/5 p-4">
                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-black/50 mb-1 block">الاسم (مثل: موسم الصيف)</label>
                      <input value={ruleForm.label} onChange={(e) => setRuleForm((p) => ({ ...p, label: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">من</label>
                      <input type="date" value={ruleForm.start_date} onChange={(e) => setRuleForm((p) => ({ ...p, start_date: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">إلى</label>
                      <input type="date" value={ruleForm.end_date} onChange={(e) => setRuleForm((p) => ({ ...p, end_date: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">السعر / ليلة (ج.م)</label>
                      <input type="number" value={ruleForm.price_per_night} onChange={(e) => setRuleForm((p) => ({ ...p, price_per_night: Number(e.target.value) }))}
                        min={0}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">أولوية (كلما زادت، كلما طُبّقت أولاً)</label>
                      <input type="number" value={ruleForm.priority} onChange={(e) => setRuleForm((p) => ({ ...p, priority: Number(e.target.value) }))}
                        min={0} max={100}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addRule} disabled={addingRule || !ruleForm.label || !ruleForm.start_date || !ruleForm.end_date || !ruleForm.price_per_night}
                      className="rounded-lg bg-brand px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50">
                      {addingRule ? "جاري الإضافة..." : "إضافة"}
                    </button>
                    <button onClick={() => setShowRuleForm(false)} className="rounded-lg border border-black/10 px-4 py-1.5 text-sm text-black/60">
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {settings.price_rules.length === 0 ? (
                <div className="py-6 text-center text-sm text-black/30">لا توجد فترات خاصة — اضغط "+ أضف فترة" لإضافة أولى</div>
              ) : (
                <div className="space-y-2">
                  {settings.price_rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between rounded-xl border border-black/8 bg-stone-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">{rule.label}</div>
                        <div className="text-xs text-black/40">
                          {rule.start_date} — {rule.end_date}
                          {rule.min_nights ? ` · حد أدنى ${rule.min_nights} ليالٍ` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand">{EGP(rule.price_per_night)}</span>
                        <button onClick={() => deleteRule(rule.id)} className="text-xs text-red-400 hover:text-red-600">حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ---- Save ---- */}
            {msg && (
              <div className={`mb-4 rounded-xl p-3 text-center text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </div>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-brand py-3 text-base font-bold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ إعدادات التسعير"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
