"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ImportedListing, Property } from "@/lib/types";
import { egp, statusAr } from "@/lib/format";

export default function HostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [payouts, setPayouts] = useState<{ total_pending: string; total_paid: string } | null>(null);
  const [url, setUrl] = useState("https://www.airbnb.com/rooms/12345678");
  const [imported, setImported] = useState<ImportedListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.roles.includes("host")) {
      api.myProperties().then((p) => setListings(p.items)).catch(() => undefined);
      api.myPayouts().then(setPayouts).catch(() => undefined);
    }
  }, [user]);

  if (loading) return <p className="text-black/50">…</p>;
  if (!user?.roles.includes("host"))
    return <p className="text-black/50">هذه الصفحة للمضيفين فقط. فعّل حساب المضيف من صفحة الملف الشخصي.</p>;

  async function runImport() {
    setBusy(true);
    setError(null);
    setImported(null);
    try {
      setImported(await api.importAirbnb(url));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "فشل الاستيراد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="عقاراتي" value={String(listings.length)} />
        <Stat label="مستحقات معلّقة" value={payouts ? egp(payouts.total_pending) : "—"} />
        <Stat label="مدفوع" value={payouts ? egp(payouts.total_paid) : "—"} />
      </div>

      <div className="card border-brand/40 bg-brand-light/40 p-5">
        <h2 className="font-medium">استورد قائمتك من Airbnb</h2>
        <p className="mt-1 text-sm text-black/50">الصق رابط الإعلان، وإحنا بنجيب الصور والوصف والمرافق.</p>
        <div className="mt-3 flex gap-2">
          <input className="input ltr:text-left" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button onClick={runImport} disabled={busy} className="btn-primary whitespace-nowrap disabled:opacity-50">
            {busy ? "…" : "استيراد"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        {imported && (
          <div className="mt-4 rounded-lg bg-white p-4 text-sm">
            <p className="font-medium">{imported.title ?? "بدون عنوان"}</p>
            <p className="mt-1 text-black/50">{imported.description?.slice(0, 160)}</p>
            <p className="mt-2 text-black/60">
              {imported.images.length} صورة · {imported.amenities.length} مرفق · حتى {imported.max_guests ?? "?"} ضيوف
            </p>
            {imported.missing_fields.length > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                مطلوب إكمالها يدويًا: {imported.missing_fields.join("، ")}
              </p>
            )}
            <button
              onClick={() => {
                sessionStorage.setItem("import_prefill", JSON.stringify(imported));
                router.push("/host/new");
              }}
              className="btn-primary mt-3 text-xs"
            >
              أكمل في المعالج ‹
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">قوائمي</h2>
          <Link href="/host/new" className="btn-outline text-xs">
            + إضافة عقار يدويًا
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="text-black/50">لا توجد قوائم بعد.</p>
        ) : (
          <div className="space-y-2">
            {listings.map((l) => (
              <div key={l.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="text-sm text-black/50">{l.area}</p>
                </div>
                <span className="badge bg-black/5 text-black/60">{statusAr(l.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand/[0.06] bg-gradient-to-br from-gold-light to-brand-light/40 p-4">
      <p className="text-xs font-semibold text-black/55">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand sm:text-2xl">{value}</p>
    </div>
  );
}
