"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

// All three actions below are gated a second time by RLS itself:
// user_roles writes require is_super_admin() (0004_rls.sql), so even if
// this check were removed, a non-super_admin's request would still be
// rejected by Postgres.
async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") throw new Error("غير مصرّح — للـ super_admin فقط.");
  return user;
}

export async function setUserRole(authUserId: string, role: AppRole) {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_roles")
    .upsert({ auth_user_id: authUserId, role }, { onConflict: "auth_user_id" });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

// Approves a self-registered volunteer candidate: assigns them a stage
// AND grants the 'volunteer' app role in one step, since neither alone
// gives them the elevated read access (owners_select_volunteer requires
// both current_app_role() = 'volunteer' and a matching assigned_stage_id).
export async function approveVolunteer(volunteerId: string, stageId: string) {
  const user = await requireSuperAdmin();
  const supabase = await createClient();

  const { data: volunteer, error: fetchError } = await supabase
    .from("volunteers")
    .select("auth_user_id")
    .eq("id", volunteerId)
    .single();
  if (fetchError || !volunteer?.auth_user_id) return { error: "المتطوع غير موجود." };

  const { error: stageError } = await supabase
    .from("volunteers")
    .update({ assigned_stage_id: stageId })
    .eq("id", volunteerId);
  if (stageError) return { error: stageError.message };

  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ auth_user_id: volunteer.auth_user_id, role: "volunteer" }, { onConflict: "auth_user_id" });
  if (roleError) return { error: roleError.message };

  void user;
  revalidatePath("/admin");
  revalidatePath("/volunteers");
  return { ok: true };
}
