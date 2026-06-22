"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, refresh, loading } = useAuth();
  const [nationalId, setNationalId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instapay, setInstapay] = useState("");
  const [wallet, setWallet] = useState("");
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  if (loading) return <p className="text-black/50">…</p>;
  if (!user) return <p className="text-black/50">سجّل الدخول أولاً.</p>;

  async function saveNationalId(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    try {
      await api.setNationalId(nationalId);
      await refresh();
      setMsg("تم حفظ الرقم القومي.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الحفظ");
    }
  }

  async function becomeHost() {
    await api.becomeHost();
    await refresh();
  }

  async function savePayout(e: React.FormEvent) {
    e.preventDefault();
    setPayoutMsg(null);
    await api.updateProfile({ instapay_handle: instapay || undefined, vodafone_cash_number: wallet || undefined });
    await refresh();
    setPayoutMsg("تم حفظ بيانات الاستلام.");
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-medium">{user.full_name}</h1>
        <p className="mt-1 text-sm text-black/50">{user.phone_number}</p>
        <div className="mt-2 flex gap-2">
          {user.roles.map((r) => (
            <span key={r} className="badge bg-brand-light text-brand">
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium">الرقم القومي</h2>
        <p className="mt-1 text-sm text-black/50">مطلوب للحجز ولبوابات الكمبوند (14 رقم).</p>
        {user.national_id ? (
          <p className="mt-3 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand">مسجّل: {user.national_id}</p>
        ) : (
          <form onSubmit={saveNationalId} className="mt-3 flex gap-2">
            <input className="input" placeholder="14 رقم" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
            <button className="btn-primary">حفظ</button>
          </form>
        )}
        {msg && <p className="mt-2 text-sm text-brand">{msg}</p>}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>

      {user.roles.includes("host") && (
        <div className="card p-6">
          <h2 className="font-medium">بيانات استلام الأرباح</h2>
          <p className="mt-1 text-sm text-black/50">لتحويل مستحقاتك بعد خصم العمولة.</p>
          <form onSubmit={savePayout} className="mt-3 space-y-2">
            <input className="input" placeholder={user.instapay_handle ?? "حساب إنستاباي (you@instapay)"} value={instapay} onChange={(e) => setInstapay(e.target.value)} />
            <input className="input" placeholder={user.vodafone_cash_number ?? "رقم فودافون كاش"} value={wallet} onChange={(e) => setWallet(e.target.value)} />
            <button className="btn-primary">حفظ</button>
          </form>
          {payoutMsg && <p className="mt-2 text-sm text-brand">{payoutMsg}</p>}
        </div>
      )}

      {!user.roles.includes("host") && (
        <div className="card p-6">
          <h2 className="font-medium">أصبح مضيفًا</h2>
          <p className="mt-1 text-sm text-black/50">اعرض شاليهك أو فيلتك للإيجار.</p>
          <button onClick={becomeHost} className="btn-outline mt-3">
            تفعيل حساب المضيف
          </button>
        </div>
      )}
    </div>
  );
}
