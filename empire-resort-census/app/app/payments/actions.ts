"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAINTENANCE_CHARGE_YEARS } from "@/lib/constants";

export interface UploadPaymentResult {
  error?: string;
}

// Runs as the authenticated caller, not service-role — the storage upload
// and the table insert are both still subject to the RLS/storage policies
// in 0006_maintenance_payments.sql. Owner-only, self-reported, same as
// every other piece of data in this app: staff never upload on an owner's
// behalf, they only view what's already there (see owners/[id]/page.tsx).
export async function uploadMaintenancePayment(formData: FormData): Promise<UploadPaymentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الجلسة منتهية، برجاء تسجيل الدخول من جديد." };

  const { data: owner } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!owner) return { error: "لازم تسجّل وحدتك الأول." };

  const chargeYear = formData.get("charge_year") as string;
  if (!MAINTENANCE_CHARGE_YEARS.includes(chargeYear as (typeof MAINTENANCE_CHARGE_YEARS)[number])) {
    return { error: "سنة غير صالحة." };
  }

  const amountRaw = (formData.get("amount_declared") as string)?.trim();
  const amountDeclared = amountRaw ? Number(amountRaw) : null;
  if (amountRaw && Number.isNaN(amountDeclared)) {
    return { error: "المبلغ لازم يكون رقم." };
  }

  const note = (formData.get("note") as string)?.trim() || null;

  const file = formData.get("receipt") as File | null;
  if (!file || file.size === 0) {
    return { error: "برجاء اختيار صورة الإيصال أو سند التحويل." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "الملف لازم يكون صورة." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${owner.id}/${chargeYear}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-receipts")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("maintenance_payments").insert({
    owner_id: owner.id,
    charge_year: chargeYear,
    amount_declared: amountDeclared,
    receipt_path: path,
    note,
  });
  if (insertError) return { error: insertError.message };

  revalidatePath("/payments");
  return {};
}
