"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/lib/types";
import { egp, statusAr } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-800",
  pending_approval: "bg-amber-50 text-amber-800",
  confirmed: "bg-brand-light text-brand",
  cancelled: "bg-black/5 text-black/50",
  expired: "bg-black/5 text-black/50",
  completed: "bg-blue-50 text-blue-800",
};

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user)
      api
        .myBookings()
        .then((p) => setItems(p.items))
        .catch(() => undefined)
        .finally(() => setReady(true));
  }, [user]);

  if (loading) return <p className="text-black/50">…</p>;
  if (!user) return <p className="text-black/50">سجّل الدخول لعرض حجوزاتك.</p>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">حجوزاتي</h1>
      <p className="mb-5 text-sm text-black/50">تابع حالة حجوزاتك ومدفوعاتك.</p>

      {!ready ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-14 text-center">
          <p className="text-black/50">لا توجد حجوزات بعد.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">
            ابدأ البحث
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="card flex items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">
                    {b.check_in} ← {b.check_out}
                  </p>
                  <p className="text-sm text-black/50">
                    {b.nights} ليالٍ · {b.guests_count} ضيوف · المطلوب {egp(b.amount_due_now)}
                  </p>
                </div>
              </div>
              <span className={`badge ${STATUS_STYLE[b.status] ?? "bg-black/5"}`}>{statusAr(b.status)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
