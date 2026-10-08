"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

// Self-registration as a CANDIDATE volunteer only — RLS
// (volunteers_insert, 0004_rls.sql) requires assigned_stage_id to be null
// here; only super_admin can promote the candidate afterwards
// (see app/admin/actions.ts:approveVolunteer).
export async function registerAsVolunteerCandidate(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "الجلسة منتهية." };

  const fullName = (formData.get("full_name") as string)?.trim();
  if (!fullName) return { error: "برجاء إدخال الاسم." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("volunteers")
    .insert({ auth_user_id: user.authUserId, full_name: fullName, assigned_stage_id: null });
  if (error) return { error: error.message };

  revalidatePath("/volunteers");
  return { ok: true };
}

export async function logQuickAttempt(ownerId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "الجلسة منتهية." };

  const supabase = await createClient();
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("auth_user_id", user.authUserId)
    .maybeSingle();
  if (!volunteer) return { error: "لست مسجّلًا كمتطوع." };

  const outcome = formData.get("outcome") as string;
  const { error } = await supabase.from("contact_attempts").insert({
    owner_id: ownerId,
    volunteer_id: volunteer.id,
    method: "شخصي",
    outcome,
  });
  if (error) return { error: error.message };

  revalidatePath("/volunteers");
  return { ok: true };
}
