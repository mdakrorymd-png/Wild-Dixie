"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Real Supabase Auth email-OTP flow. There is no "pick a role" shortcut —
// signInWithOtp/verifyOtp are the only doors in, per spec §2 constraint 1.
//
// Originally phone-OTP per the spec's literal text; switched to email-OTP
// because phone OTP requires a paid SMS gateway (Twilio et al.) with no
// free tier that works past a handful of manually-verified numbers, and
// this project needs a genuinely free option to test with. Supabase's
// built-in email sending is free (rate-limited — fine for testing, but
// plug in real SMTP, e.g. Resend/SendGrid, before onboarding 650 owners
// for real). The phone number is NOT gone from the system — it's still
// collected and still unique-enforced in owner_phones (see onboarding) —
// it's just no longer the login channel.
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-xl font-bold text-brand">تسجيل الدخول</h1>
      <p className="mb-6 text-sm text-muted">
        نظام إحصاء ملاك Empire Resort. هدفنا معرفة الصورة الحقيقية للملاك، مش تجميع مؤيدين لموقف
        معين.
      </p>

      {step === "email" && (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm text-gray-700">البريد الإلكتروني</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال كود التحقق"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="space-y-3">
          <label className="block text-sm text-gray-700">كود التحقق المرسل إلى {email}</label>
          <input
            className="input"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "جاري التحقق..." : "تأكيد"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-gray-500"
            onClick={() => setStep("email")}
          >
            تغيير البريد الإلكتروني
          </button>
        </form>
      )}
    </div>
  );
}
