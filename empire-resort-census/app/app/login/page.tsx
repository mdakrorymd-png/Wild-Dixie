"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Real Supabase Auth phone-OTP flow. There is no "pick a role" shortcut —
// signInWithOtp/verifyOtp are the only doors in, per spec §2 constraint 1.
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
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
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
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

      {step === "phone" && (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm text-gray-700">رقم التليفون</label>
          <input
            className="input"
            type="tel"
            placeholder="+201xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          <label className="block text-sm text-gray-700">كود التحقق المرسل إلى {phone}</label>
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
            onClick={() => setStep("phone")}
          >
            تغيير رقم التليفون
          </button>
        </form>
      )}
    </div>
  );
}
