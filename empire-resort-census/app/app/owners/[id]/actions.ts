"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";

export async function updateContactStatus(ownerId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canManage(user.role)) return { error: "غير مصرّح." };

  const supabase = await createClient();
  const contactStatus = formData.get("contact_status") as string;
  const contactMethod = (formData.get("contact_method") as string) || null;

  const { error } = await supabase
    .from("owners")
    .update({
      contact_status: contactStatus,
      contact_method: contactMethod,
      last_contact_at: new Date().toISOString(),
    })
    .eq("id", ownerId);
  if (error) return { error: error.message };

  revalidatePath(`/owners/${ownerId}`);
  return { ok: true };
}

export async function addContactAttempt(ownerId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "غير مصرّح." };

  const supabase = await createClient();
  const method = formData.get("method") as string;
  const outcome = formData.get("outcome") as string;
  const notes = (formData.get("notes") as string) || null;

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("auth_user_id", user.authUserId)
    .maybeSingle();

  const { error } = await supabase.from("contact_attempts").insert({
    owner_id: ownerId,
    volunteer_id: volunteer?.id ?? null,
    method,
    outcome,
    notes,
  });
  if (error) return { error: error.message };

  revalidatePath(`/owners/${ownerId}`);
  return { ok: true };
}

// Setting `disputed` removes the record from public stats (0005_views.sql
// filters verification_status <> 'disputed'). Confirming brings it back /
// upgrades it. Only super_admin / census_manager can do this — enforced
// both here and by trg_guard_owner_privileged_fields at the DB level.
export async function setVerificationStatus(
  ownerId: string,
  status: "self_reported" | "confirmed" | "disputed"
) {
  const user = await getCurrentUser();
  if (!user || !canManage(user.role)) return { error: "غير مصرّح." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("owners")
    .update({ verification_status: status })
    .eq("id", ownerId);
  if (error) return { error: error.message };

  revalidatePath(`/owners/${ownerId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
