import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";
import { CONTACT_OUTCOME_OPTIONS, CONTACT_STATUS_OPTIONS, TOPIC_SECTIONS } from "@/lib/constants";
import { addContactAttempt, setVerificationStatus, updateContactStatus } from "./actions";

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManage(user.role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("owners")
    .select("*, units(unit_number, stage_id, building, zone)")
    .eq("id", id)
    .maybeSingle();
  if (!owner) notFound();

  const [
    { data: name },
    { data: phone },
    { data: mainPositions },
    { data: topics },
    { data: participation },
    { data: payment },
    { data: attempts },
    { data: maintenancePayments },
  ] = await Promise.all([
    supabase.from("owner_names").select("full_name").eq("owner_id", id).maybeSingle(),
    supabase.from("owner_phones").select("phone").eq("owner_id", id).maybeSingle(),
    supabase.from("main_position_responses").select("*").eq("owner_id", id),
    supabase.from("topic_responses").select("*").eq("owner_id", id),
    supabase.from("participation_responses").select("*").eq("owner_id", id),
    supabase.from("payment_status").select("status").eq("owner_id", id).maybeSingle(),
    supabase
      .from("contact_attempts")
      .select("*")
      .eq("owner_id", id)
      .order("attempted_at", { ascending: false }),
    supabase
      .from("maintenance_payments")
      .select("*")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const maintenanceWithUrls = await Promise.all(
    (maintenancePayments ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from("payment-receipts")
        .createSignedUrl(p.receipt_path, 3600);
      return { ...p, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand">{name?.full_name ?? "بدون اسم"}</h1>
        <p className="text-sm text-muted">
          وحدة {owner.units?.unit_number} {owner.units?.building ? `— ${owner.units.building}` : ""}
        </p>
      </div>

      <div className="card grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <p>التليفون: {phone?.phone ?? "—"}</p>
        <p>حالة التحقق: {owner.verification_status}</p>
        <p>حالة البيانات: {owner.census_status}</p>
        <p>حالة السداد: {payment?.status ?? "غير محدد"}</p>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-brand">حالة التحقق من الوحدة</h2>
        <p className="text-xs text-muted">
          البيانات مُدخلة ذاتيًا (self-reported) من المالك نفسه بحسابه الموثّق برقم تليفونه. تحويلها
          إلى &quot;نزاع&quot; يستثنيها من الإحصائيات العامة لحد ما تتراجع.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={setVerificationStatus.bind(null, id, "confirmed")}>
            <button className="btn-secondary" disabled={owner.verification_status === "confirmed"}>
              تأكيد الهوية
            </button>
          </form>
          <form action={setVerificationStatus.bind(null, id, "disputed")}>
            <button className="btn-secondary" disabled={owner.verification_status === "disputed"}>
              تحويل إلى نزاع
            </button>
          </form>
          <form action={setVerificationStatus.bind(null, id, "self_reported")}>
            <button
              className="btn-secondary"
              disabled={owner.verification_status === "self_reported"}
            >
              إعادة لتصريح ذاتي
            </button>
          </form>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-brand">حالة التواصل</h2>
        <form action={updateContactStatus.bind(null, id)} className="flex flex-wrap gap-2">
          <select name="contact_status" defaultValue={owner.contact_status ?? ""} className="input">
            {CONTACT_STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            name="contact_method"
            className="input"
            placeholder="وسيلة التواصل"
            defaultValue={owner.contact_method ?? ""}
          />
          <button className="btn-primary">حفظ</button>
        </form>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-brand">الموقف العام</h2>
        {(mainPositions ?? []).length === 0 && <p className="text-sm text-muted">لا يوجد رد.</p>}
        <ul className="list-inside list-disc text-sm">
          {(mainPositions ?? []).map((p) => (
            <li key={p.id}>
              {p.position_text}
              {p.free_text ? ` — ${p.free_text}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-brand">الأقسام المستقلة</h2>
        {(topics ?? []).length === 0 && <p className="text-sm text-muted">لا توجد ردود.</p>}
        <dl className="space-y-2 text-sm">
          {(topics ?? []).map((t) => {
            const section = TOPIC_SECTIONS.find((s) => s.key === t.topic_key);
            return (
              <div key={t.id}>
                <dt className="font-medium text-gray-700">{section?.label ?? t.topic_key}</dt>
                <dd className="text-gray-600">
                  {t.stance}
                  {t.detail ? ` — ${t.detail}` : ""}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-brand">المشاركة</h2>
        <ul className="list-inside list-disc text-sm">
          {(participation ?? []).map((p) => (
            <li key={p.id}>{p.option_text}</li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-brand">مدفوعات فروق الصيانة (٢٠٢٥ / ٢٠٢٦)</h2>
        {maintenanceWithUrls.length === 0 && (
          <p className="text-sm text-muted">لا توجد دفعات مسجّلة.</p>
        )}
        <ul className="space-y-2 text-sm">
          {maintenanceWithUrls.map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-b border-gray-100 pb-2">
              {p.signedUrl && (
                <a href={p.signedUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={p.signedUrl}
                    alt="صورة الإيصال"
                    className="h-12 w-12 rounded object-cover"
                  />
                </a>
              )}
              <span>
                {p.charge_year} — {p.amount_declared != null ? `${p.amount_declared} جنيه` : "بدون مبلغ"}
                {" — "}
                {new Date(p.created_at).toLocaleString("ar-EG")}
                {p.note ? ` — ${p.note}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-brand">سجل محاولات التواصل</h2>
        <form action={addContactAttempt.bind(null, id)} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input name="method" className="input" placeholder="الوسيلة (تليفون/واتساب...)" />
          <select name="outcome" className="input">
            {CONTACT_OUTCOME_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input name="notes" className="input sm:col-span-1" placeholder="ملاحظات" />
          <button className="btn-primary">إضافة</button>
        </form>
        <ul className="divide-y divide-gray-100 text-sm">
          {(attempts ?? []).map((a) => (
            <li key={a.id} className="py-2">
              {new Date(a.attempted_at).toLocaleString("ar-EG")} — {a.method} — {a.outcome}
              {a.notes ? ` — ${a.notes}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
