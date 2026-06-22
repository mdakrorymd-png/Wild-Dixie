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

export default function LoginPage() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const tokens = await api.login({ phone_number: phone, password });
      await loginWithTokens(tokens.access_token, remember);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="تسجيل الدخول" subtitle="أهلاً بعودتك — سجّل دخولك للمتابعة">
      <form onSubmit={submit} className="space-y-3">
        <LabeledInput icon={PhoneIcon} placeholder="رقم الموبايل (01xxxxxxxxx)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <LabeledInput icon={LockIcon} type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-black/60">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-brand" />
            تذكّرني
          </label>
          <span className="cursor-not-allowed text-black/35">نسيت كلمة المرور؟</span>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-black/50">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-medium text-brand">
          أنشئ حسابًا
        </Link>
      </p>
    </AuthShell>
  );
}
