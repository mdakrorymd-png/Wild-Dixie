"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// A click-through confirm page, not an auto-firing route handler. Mail
// providers (Outlook/Hotmail in particular) pre-scan links in incoming
// email by visiting them automatically to check for phishing — if this
// page verified the OTP the instant it loaded, that automated visit would
// consume the one-time token before the real person ever clicked it,
// leaving them locked out with no visible error. Requiring an explicit
// button click means a scanner that only fetches the page (and doesn't
// click buttons) can't burn the link.
function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = params.get("next") ?? "/";

  async function confirm() {
    if (!tokenHash || !type) {
      setStatus("error");
      setError("الرابط غير صالح.");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm text-center">
      <h1 className="mb-4 text-xl font-bold text-brand">تأكيد تسجيل الدخول</h1>
      {status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <a href="/login" className="btn-secondary inline-block">
            الرجوع لتسجيل الدخول
          </a>
        </div>
      ) : (
        <button className="btn-primary w-full" onClick={confirm} disabled={status === "loading"}>
          {status === "loading" ? "جاري الدخول..." : "دخول"}
        </button>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
