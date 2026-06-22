"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Booking, OwnerStatement } from "@/lib/types";
import { egp, monthAr, statusAr } from "@/lib/format";

type Tab = "statement" | "bookings" | "payouts";

interface PayoutItem {
  id: string;
  net_amount: string;
  status: string;
  booking_id: string;
}

export default function OwnerDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("statement");
  const [stmt, setStmt] = useState<OwnerStatement | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);

  useEffect(() => {
    if (!user?.roles.includes("host")) return;
    api.ownerStatement().then(setStmt).catch(() => undefined);
    api.hostingBookings().then((p) => setBookings(p.items)).catch(() => undefined);
    api.myPayouts().then((p) => setPayouts(p.items)).catch(() => undefined);
  }, [user]);

  async function issuePass(id: string) {
    try {
      await api.setGatePass(id, "issued");
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, gate_pass_status: "issued" } : b)));
    } catch {
      /* ignore */
    }
  }

  if (loading) return <p className="text-black/50">…</p>;
  if (!user?.roles.includes("host"))
    return <p className="text-black/50">لوحة المالك للمضيفين فقط. فعّل حساب المضيف من الملف الشخصي.</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "statement", label: "الكشف الشهري" },
    { id: "bookings", label: "الحجوزات" },
    { id: "payouts", label: "المستحقات" },
  ];

  const waText = stmt
    ? `كشف Wild Dixie Escapes\nصافي دخلك: ${egp(stmt.total_net)}\nمعلّق: ${egp(stmt.total_pending)} · مدفوع: ${egp(stmt.total_paid)}\nعدد الحجوزات: ${stmt.total_bookings}`
    : "";
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">لوحة المالك</h1>
        <Link href="/host" className="text-sm font-medium text-aqua print:hidden">إدارة عقاراتي ←</Link>
      </div>
      <p className="mb-4 text-sm text-black/55">شفافية كاملة: كل جنيه، عمولة، وصافي — جنب بعض.</p>

      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        <button onClick={() => window.print()} className="btn-outline text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          تحميل / طباعة الكشف
        </button>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
          إرسال على واتساب
        </a>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="صافي دخلك" value={stmt ? egp(stmt.total_net) : "—"} highlight />
        <SummaryCard label="معلّق (تحت التحويل)" value={stmt ? egp(stmt.total_pending) : "—"} />
        <SummaryCard label="مدفوع" value={stmt ? egp(stmt.total_paid) : "—"} />
        <SummaryCard label="عدد الحجوزات" value={stmt ? String(stmt.total_bookings) : "—"} />
      </div>

      {/* Tabs */}
      <div className="mb-5 inline-flex gap-1 rounded-2xl border border-brand/10 bg-white p-1 shadow-[var(--shadow-soft)] print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm transition ${tab === t.id ? "bg-brand text-white" : "text-black/60 hover:bg-brand/5"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "statement" && (
        <div className="card overflow-hidden">
          {!stmt || stmt.months.length === 0 ? (
            <p className="py-12 text-center text-sm text-black/45">لا توجد إيرادات بعد — أول حجز هيظهر هنا.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-brand-light/60 text-xs text-brand">
                  <tr>
                    <th className="px-4 py-3 font-semibold">الشهر</th>
                    <th className="px-4 py-3 font-semibold">حجوزات</th>
                    <th className="px-4 py-3 font-semibold">إجمالي الإيجار</th>
                    <th className="px-4 py-3 font-semibold">العمولة</th>
                    <th className="px-4 py-3 font-semibold">صافي دخلك</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {stmt.months.map((m) => (
                    <tr key={m.month} className="border-t border-brand/[0.06]">
                      <td className="px-4 py-3 font-medium">{monthAr(m.month)}</td>
                      <td className="px-4 py-3">{m.bookings}</td>
                      <td className="px-4 py-3">{egp(m.gross)}</td>
                      <td className="px-4 py-3 text-coral-dark">− {egp(m.commission)}</td>
                      <td className="px-4 py-3 font-bold text-brand">{egp(m.net)}</td>
                      <td className="px-4 py-3">
                        {Number(m.pending) > 0 ? (
                          <span className="badge bg-gold-light text-gold-dark">معلّق</span>
                        ) : (
                          <span className="badge bg-brand-light text-brand">مدفوع</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="border-t border-brand/[0.06] px-4 py-3 text-xs text-black/45">
            النظافة على الضيف ومش بتتخصم منك · التحويل عبر إنستاباي · الأرقام محسوبة لحظيًا من حجوزاتك.
          </p>
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-2">
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-black/45">لا توجد حجوزات بعد.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{b.check_in} ← {b.check_out}</p>
                    <p className="text-sm text-black/50">{b.nights} ليالٍ · {b.guests_count} ضيوف · {egp(b.total_amount)}</p>
                  </div>
                  <span className="badge bg-brand-light text-brand">{statusAr(b.status)}</span>
                </div>
                {b.status === "confirmed" && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand/[0.06] pt-3 text-sm">
                    <span className="text-black/55">
                      تصريح البوابة:{" "}
                      {b.gate_pass_status === "issued" ? (
                        <span className="font-medium text-brand">تم الإصدار ✓</span>
                      ) : (
                        <span className="font-medium text-gold-dark">بانتظار الإصدار</span>
                      )}
                      {b.guest_car_plate && <span className="text-black/40"> · لوحة {b.guest_car_plate}</span>}
                    </span>
                    {b.gate_pass_status !== "issued" && (
                      <button onClick={() => issuePass(b.id)} className="btn-primary text-xs">
                        إصدار التصريح
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-2">
          {payouts.length === 0 ? (
            <p className="py-10 text-center text-sm text-black/45">لا توجد مستحقات بعد.</p>
          ) : (
            payouts.map((p) => (
              <div key={p.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">صافي {egp(p.net_amount)}</p>
                  <p className="text-sm text-black/50">حجز {p.booking_id.slice(0, 8)}</p>
                </div>
                <span className={`badge ${p.status === "paid" ? "bg-brand-light text-brand" : "bg-gold-light text-gold-dark"}`}>
                  {p.status === "paid" ? "تم التحويل" : "تحت التحويل"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-gold/40 bg-gradient-to-br from-gold-light to-white" : "border-brand/[0.06] bg-white"}`}>
      <p className="text-xs font-semibold text-black/55">{label}</p>
      <p className={`mt-1 text-xl font-bold sm:text-2xl ${highlight ? "text-gold-dark" : "text-brand"}`}>{value}</p>
    </div>
  );
}
