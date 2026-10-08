"use client";

import { useRef, useState, useTransition } from "react";
import type { MaintenancePaymentRow } from "@/lib/types";
import { uploadMaintenancePayment } from "./actions";

export type PaymentWithUrl = MaintenancePaymentRow & { signedUrl: string | null };

export default function PaymentsForm({
  year,
  existing,
}: {
  year: string;
  existing: PaymentWithUrl[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  function submit(formData: FormData) {
    setError(null);
    setStatus("idle");
    startTransition(async () => {
      const result = await uploadMaintenancePayment(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("saved");
      formRef.current?.reset();
    });
  }

  return (
    <section className="card space-y-4">
      <h2 className="font-semibold text-brand">فروق صيانة {year}</h2>

      {existing.length > 0 && (
        <ul className="space-y-3">
          {existing.map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-b border-gray-100 pb-3">
              {p.signedUrl && (
                <a href={p.signedUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={p.signedUrl}
                    alt="صورة الإيصال"
                    className="h-16 w-16 rounded object-cover"
                  />
                </a>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-700">
                  {p.amount_declared != null ? `${p.amount_declared} جنيه` : "بدون مبلغ مُدخل"}
                </p>
                <p className="text-xs text-muted">
                  {new Date(p.created_at).toLocaleString("ar-EG")}
                </p>
                {p.note && <p className="text-xs text-gray-600">{p.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {existing.length === 0 && <p className="text-sm text-muted">لسه مفيش دفعات مسجّلة.</p>}

      <form ref={formRef} action={submit} className="space-y-3">
        <input type="hidden" name="charge_year" value={year} />
        <div>
          <label className="mb-1 block text-sm text-gray-700">المبلغ (اختياري)</label>
          <input name="amount_declared" type="number" step="0.01" className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">صورة الإيصال أو سند التحويل</label>
          <input name="receipt" type="file" accept="image/*" required className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">ملاحظات (اختياري)</label>
          <input name="note" className="input" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {status === "saved" && <p className="text-sm text-green-600">تم رفع الإيصال بنجاح.</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "جاري الرفع..." : "رفع"}
        </button>
      </form>
    </section>
  );
}
