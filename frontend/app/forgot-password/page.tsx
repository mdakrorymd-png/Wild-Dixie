"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthShell, LabeledInput } from "@/components/AuthShell";

const PhoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
);
const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.forgotPassword({ phone_number: phone });
      if (res.debug_otp) setHint(`كود التحقق (وضع تجربة): ${res.debug_otp}`);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الكود");
    } finally {
      setBusy(false);
    }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const tokens = await api.resetPassword({ phone_number: phone, code, new_password: password });
      await loginWithTokens(tokens.access_token, true);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تغيير كلمة المرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="نسيت كلمة المرور"
      subtitle={step === "phone" ? "اكتب رقمك وهنبعتلك كود تغيير كلمة المرور" : `أدخل الكود المُرسل إلى ${phone} وكلمة مرور جديدة`}
    >
      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <LabeledInput icon={PhoneIcon} type="tel" inputMode="tel" placeholder="رقم الموبايل (01xxxxxxxxx)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : "إرسال الكود"}
          </button>
        </form>
      ) : (
        <form onSubmit={doReset} className="space-y-3">
          {hint && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{hint}</p>}
          <input
            className="input text-center text-lg tracking-[0.5em]"
            dir="ltr"
            inputMode="numeric"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <LabeledInput icon={LockIcon} type="password" placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : "تغيير كلمة المرور والدخول"}
          </button>
          <button type="button" onClick={() => setStep("phone")} className="btn-outline w-full">
            رجوع
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-black/50">
        تفتكرتها؟{" "}
        <Link href="/login" className="font-medium text-brand">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
