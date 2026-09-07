"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface RegisterResult {
  error?: string;
}

// Runs as the authenticated caller (not service-role), so every insert
// here is still subject to the RLS policies in 0004_rls.sql — the unit
// UNIQUE constraint and the phone UNIQUE constraint are what actually
// stop double-registration, not this function's logic.
export async function registerOwner(formData: FormData): Promise<RegisterResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الجلسة منتهية، برجاء تسجيل الدخول من جديد." };

  const unitId = formData.get("unit_id") as string;
  const fullName = (formData.get("full_name") as string)?.trim();
  if (!unitId || !fullName) return { error: "برجاء اختيار الوحدة وإدخال الاسم." };
  if (!user.phone) return { error: "لا يوجد رقم تليفون موثّق على هذا الحساب." };

  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .insert({ auth_user_id: user.id, unit_id: unitId })
    .select("id")
    .single();

  if (ownerError) {
    if (ownerError.code === "23505") {
      return { error: "هذه الوحدة مسجّلة بالفعل، أو لديك حساب مسجّل من قبل." };
    }
    return { error: ownerError.message };
  }

  const { error: nameError } = await supabase
    .from("owner_names")
    .insert({ owner_id: owner.id, full_name: fullName });
  if (nameError) return { error: nameError.message };

  const { error: phoneError } = await supabase
    .from("owner_phones")
    .insert({ owner_id: owner.id, phone: user.phone });
  if (phoneError) {
    if (phoneError.code === "23505") {
      return { error: "رقم التليفون ده مسجّل بالفعل على وحدة تانية." };
    }
    return { error: phoneError.message };
  }

  redirect("/survey");
}
