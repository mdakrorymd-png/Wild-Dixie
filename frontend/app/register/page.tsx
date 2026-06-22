"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthShell, LabeledInput } from "@/components/AuthShell";

const UserIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" /></svg>
);
const PhoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
);
const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.register({ phone_number: phone, full_name: fullName, password });
      if (res.debug_otp) setHint(`رمز التطوير: ${res.debug_otp}`);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل إنشاء الحساب");
    } finally {
      setBusy(false);
    }
  }

  async function doVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const tokens = await api.verifyPhone({ phone_number: phone, code });
      await loginWithTokens(tokens.access_token, true);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "رمز غير صحيح");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={step === "form" ? "إنشاء حساب" : "تأكيد رقمك"}
      subtitle={step === "form" ? "انضم إلى ساحل في دقيقة" : `أدخل الرمز المُرسل إلى ${phone}`}
    >
      {step === "form" ? (
        <form onSubmit={doRegister} className="space-y-3">
          <LabeledInput icon={UserIcon} placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <LabeledInput icon={PhoneIcon} placeholder="رقم الموبايل (01xxxxxxxxx)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <LabeledInput icon={LockIcon} type="password" placeholder="كلمة المرور (8 أحرف على الأقل)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : "إرسال رمز التحقق"}
          </button>
        </form>
      ) : (
        <form onSubmit={doVerify} className="space-y-3">
          {hint && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{hint}</p>}
          <input
            className="input text-center text-lg tracking-[0.5em]"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : "تأكيد"}
          </button>
          <button type="button" onClick={() => setStep("form")} className="btn-outline w-full">
            رجوع
          </button>
        </form>
      )}
    </AuthShell>
  );
}
