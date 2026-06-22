"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Booking, PaymentInstructions, PaymentMethod } from "@/lib/types";
import { egp, statusAr } from "@/lib/format";

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "بطاقة بنكية" },
  { id: "instapay", label: "إنستاباي" },
  { id: "vodafone_cash", label: "فودافون كاش" },
];

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.getBooking(id).then(setBooking).catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    if (method !== "card" && booking?.status === "pending_payment") {
      api.paymentInstructions(id, method).then(setInstructions).catch(() => setInstructions(null));
    } else {
      setInstructions(null);
    }
  }, [method, id, booking?.status]);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await api.pay(id, { method, receipt_url: method === "card" ? undefined : receipt });
      await load();
      setDone(method === "card" ? "تم تأكيد الدفع والحجز." : "تم استلام الإيصال. بانتظار تأكيد الإدارة (خلال ساعة).");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر الدفع");
    } finally {
      setBusy(false);
    }
  }

  if (!booking) return <p className="text-black/50">{error ?? "…"}</p>;
  const needsReceipt = method !== "card";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">تفاصيل الحجز</h1>
          <span className="badge bg-black/5">{statusAr(booking.status)}</span>
        </div>
        <p className="mt-2 text-sm text-black/50">
          {booking.check_in} ← {booking.check_out} · {booking.nights} ليالٍ · {booking.guests_count} ضيوف
        </p>
        <div className="mt-3 border-t border-black/10 pt-3 text-sm">
          <div className="flex justify-between font-medium text-brand">
            <span>المطلوب الآن</span>
            <span>{egp(booking.amount_due_now)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <span aria-hidden>⚡</span>
        <span>الكهرباء والمياه تُدفع بشكل منفصل بواسطة الضيف في العقار. الإلغاء قبل أقل من ٧ أيام يخسّر ١٠٠٪.</span>
      </div>

      {booking.status === "confirmed" && (
        <div className="card bg-brand-light p-5 text-center text-brand">✓ الحجز مؤكد</div>
      )}

      {booking.status === "pending_payment" && !done && (
        <div className="card p-5">
          <h2 className="font-medium">طريقة الدفع</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded-lg border px-2 py-2 text-sm ${
                  method === m.id ? "border-brand bg-brand-light text-brand" : "border-black/15"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {needsReceipt && instructions && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-900">حوّل المبلغ ثم ارفع صورة الإيصال</p>
              <div className="mt-2 flex justify-between">
                <span className="text-amber-800">{method === "instapay" ? "عنوان إنستاباي" : "رقم المحفظة"}</span>
                <span className="font-medium">{instructions.pay_to}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-amber-800">المبلغ</span>
                <span className="font-medium">{egp(instructions.amount)}</span>
              </div>
              <input
                className="input mt-3"
                placeholder="رابط صورة الإيصال (URL)"
                value={receipt}
                onChange={(e) => setReceipt(e.target.value)}
              />
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button onClick={pay} disabled={busy || (needsReceipt && !receipt)} className="btn-primary mt-4 w-full disabled:opacity-50">
            {busy ? "…" : needsReceipt ? "تأكيد رفع الإيصال" : `ادفع ${egp(booking.amount_due_now)}`}
          </button>
        </div>
      )}

      {done && <div className="card bg-brand-light p-5 text-center text-brand">{done}</div>}
    </div>
  );
}
