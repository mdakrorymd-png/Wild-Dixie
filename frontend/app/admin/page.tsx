"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Lead, LeadStatus, Property } from "@/lib/types";
import { egp } from "@/lib/format";

interface PendingPayment {
  id: string;
  booking_id: string;
  method: string;
  amount: string;
  receipt_url: string | null;
}
interface Dispute {
  id: string;
  booking_id: string;
  reason: string;
  status: string;
}

type Tab = "listings" | "payments" | "disputes" | "leads";

const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "جديد" },
  { id: "contacted", label: "تم التواصل" },
  { id: "qualified", label: "مؤهّل" },
  { id: "won", label: "اتقفلت" },
  { id: "lost", label: "خسرناها" },
];
const LEAD_STATUS_COLOR: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-800",
  qualified: "bg-brand-light text-brand",
  won: "bg-green-50 text-green-700",
  lost: "bg-black/5 text-black/40",
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("listings");
  const [props, setProps] = useState<Property[]>([]);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const reload = useCallback(() => {
    api.adminPendingProperties().then((p) => setProps(p.items)).catch(() => undefined);
    api.adminPendingPayments().then((p) => setPayments(p.items)).catch(() => undefined);
    api.adminDisputes().then(setDisputes).catch(() => undefined);
    api.adminListLeads().then(setLeads).catch(() => undefined);
  }, []);

  async function setLeadStatus(id: string, status: LeadStatus) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l))); // optimistic
    try {
      await api.adminUpdateLeadStatus(id, status);
    } catch {
      reload(); // revert on failure
    }
  }

  useEffect(() => {
    if (user?.roles.includes("admin")) reload();
  }, [user, reload]);

  if (loading) return <p className="text-black/50">…</p>;
  if (!user?.roles.includes("admin")) return <p className="text-black/50">صفحة الإدارة للمشرفين فقط.</p>;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "leads", label: "الليدز", count: leads.filter((l) => l.status === "new").length },
    { id: "listings", label: "مراجعة القوائم", count: props.length },
    { id: "payments", label: "تأكيد المدفوعات", count: payments.length },
    { id: "disputes", label: "المنازعات", count: disputes.length },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">لوحة الإدارة</h1>
      <p className="mb-5 text-sm text-black/50">راجِع القوائم، أكّد التحويلات، وعالِج المنازعات.</p>

      <div className="mb-6 inline-flex gap-1 rounded-2xl border border-black/[0.06] bg-white p-1 shadow-[var(--shadow-soft)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
              tab === t.id ? "bg-brand text-white" : "text-black/60 hover:bg-black/5"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`rounded-full px-1.5 text-xs ${tab === t.id ? "bg-white/25" : "bg-coral text-white"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "leads" && (
        <Section empty={leads.length === 0} emptyText="لا يوجد ليدز بعد.">
          {leads.map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {l.full_name || "بدون اسم"} · <span className="text-black/40">{l.kind === "waitlist" ? "قائمة انتظار" : "تقدير دخل"}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-black/50">
                    {[l.area, l.compound, l.bedrooms ? `${l.bedrooms} غرف` : null].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {l.estimated_net && (
                    <p className="mt-0.5 text-sm text-black/50">صافي متوقّع: {egp(l.estimated_net)}</p>
                  )}
                  <p className="mt-0.5 text-xs text-black/35">{new Date(l.created_at).toLocaleString("ar-EG")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${LEAD_STATUS_COLOR[l.status]}`}>
                    {LEAD_STATUSES.find((s) => s.id === l.status)?.label ?? l.status}
                  </span>
                  {l.whatsapp && (
                    <a
                      href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-aqua"
                    >
                      واتساب: {l.whatsapp} ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-black/[0.06] pt-3">
                {LEAD_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setLeadStatus(l.id, s.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      l.status === s.id ? "border-brand bg-brand text-white" : "border-black/10 text-black/55 hover:bg-black/5"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {tab === "listings" && (
        <Section empty={props.length === 0} emptyText="لا قوائم بانتظار المراجعة.">
          {props.map((p) => (
            <div key={p.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-black/50">{p.area}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => api.adminRejectProperty(p.id, "غير مطابق للمعايير").then(reload)} className="btn-outline border-red-200 text-red-700">
                  رفض
                </button>
                <button onClick={() => api.adminApproveProperty(p.id).then(reload)} className="btn-primary">
                  موافقة ونشر
                </button>
              </div>
            </div>
          ))}
        </Section>
      )}

      {tab === "payments" && (
        <Section empty={payments.length === 0} emptyText="لا مدفوعات بانتظار التحقق.">
          {payments.map((pay) => (
            <div key={pay.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{egp(pay.amount)}</p>
                  <p className="text-sm text-black/50">{pay.method} · حجز {pay.booking_id.slice(0, 8)}</p>
                </div>
                <span className="badge bg-amber-50 text-amber-800">بانتظار التحقق</span>
              </div>
              {pay.receipt_url && (
                <a href={pay.receipt_url} className="mt-2 inline-block text-sm text-blue-700">عرض الإيصال ↗</a>
              )}
              <div className="mt-3 flex justify-end gap-2 border-t border-black/[0.06] pt-3">
                <button onClick={() => api.adminRejectPayment(pay.id, "تحويل غير صحيح").then(reload)} className="btn-outline border-red-200 text-red-700">
                  رفض
                </button>
                <button onClick={() => api.adminApprovePayment(pay.id).then(reload)} className="btn-primary">
                  تأكيد التحويل
                </button>
              </div>
            </div>
          ))}
        </Section>
      )}

      {tab === "disputes" && (
        <Section empty={disputes.length === 0} emptyText="لا منازعات مفتوحة.">
          {disputes.map((d) => (
            <div key={d.id} className="card p-4">
              <p className="font-medium">{d.reason}</p>
              <p className="mt-1 text-sm text-black/50">حجز {d.booking_id.slice(0, 8)} · الحالة: {d.status}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ empty, emptyText, children }: { empty: boolean; emptyText: string; children: React.ReactNode }) {
  if (empty)
    return (
      <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-black/40">
        {emptyText}
      </div>
    );
  return <div className="space-y-3">{children}</div>;
}
