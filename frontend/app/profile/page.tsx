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
  const [walletProvider, setWalletProvider] = useState("فودافون كاش");
  const [walletNumber, setWalletNumber] = useState("");
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
    const handle = instapay.trim();
    await api.updateProfile({
      // Ensure InstaPay addresses always carry the "@" to avoid confusion.
      instapay_handle: handle ? (handle.includes("@") ? handle : `${handle}@instapay`) : undefined,
      vodafone_cash_number: walletNumber.trim() || undefined,
      wallet_provider: walletNumber.trim() ? walletProvider : undefined,
    });
    await refresh();
    setInstapay("");
    setWalletNumber("");
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
          <form onSubmit={savePayout} className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-black/50">حساب إنستاباي</label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-brand/15 bg-white focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/20">
                <input dir="ltr" className="w-full bg-transparent px-3.5 py-2.5 text-left text-sm outline-none" placeholder={user.instapay_handle ?? "اسمك"} value={instapay} onChange={(e) => setInstapay(e.target.value)} />
                <span dir="ltr" className="flex items-center bg-brand-light/60 px-3 text-sm font-medium text-brand">@instapay</span>
              </div>
              <p className="mt-1 text-xs text-black/40">اكتب اسمك بس وهنضيف @instapay تلقائيًا، أو اكتب عنوانك كامل بالـ@.</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-black/50">محفظة إلكترونية</label>
              <div className="flex gap-2">
                <select className="input w-36 shrink-0" value={walletProvider} onChange={(e) => setWalletProvider(e.target.value)}>
                  <option>فودافون كاش</option>
                  <option>أورنج كاش</option>
                  <option>اتصالات كاش</option>
                  <option>وي باي</option>
                </select>
                <input dir="ltr" inputMode="tel" className="input flex-1 text-left" placeholder={user.vodafone_cash_number ?? "01xxxxxxxxx"} value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)} />
              </div>
              {user.wallet_provider && <p className="mt-1 text-xs text-black/40">المسجّل حاليًا: {user.wallet_provider}</p>}
            </div>
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
