"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Real Supabase Auth email-OTP flow — a clicked sign-in link, not a typed
// code. There is no "pick a role" shortcut; this is the only door in, per
// spec §2 constraint 1.
//
// Originally phone-OTP per the spec's literal text; switched to email-OTP
// because phone OTP requires a paid SMS gateway (Twilio et al.) with no
// free tier that works past a handful of manually-verified numbers.
// Supabase's built-in email sender only sends a magic link (not a typed
// code) unless custom SMTP is configured to customize the template — so
// this goes through the link, handled by app/auth/callback/route.ts. The
// phone number is NOT gone from the system — it's still collected and
// still unique-enforced in owner_phones (see onboarding) — it's just not
// the login channel.
export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-xl font-bold text-brand">تسجيل الدخول</h1>
      <p className="mb-6 text-sm text-muted">
        نظام إحصاء ملاك Empire Resort. هدفنا معرفة الصورة الحقيقية للملاك، مش تجميع مؤيدين لموقف
        معين.
      </p>

      {sent ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            بعتنالك رابط تسجيل الدخول على <span className="font-semibold">{email}</span>. افتح
            بريدك الإلكتروني ودوس على الرابط للدخول.
          </p>
          <button
            type="button"
            className="w-full text-sm text-gray-500"
            onClick={() => setSent(false)}
          >
            تغيير البريد الإلكتروني
          </button>
        </div>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
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
            {loading ? "جاري الإرسال..." : "إرسال رابط الدخول"}
          </button>
        </form>
      )}
    </div>
  );
}
