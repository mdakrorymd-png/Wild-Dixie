import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

export interface CurrentUser {
  authUserId: string;
  role: AppRole | null;
  ownerId: string | null;
}

// Reads role/ownership the same way the RLS policies do — via the
// user_roles table and the owners table — so what the UI decides to show
// always matches what the database will actually allow.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: roleRow }, { data: ownerRow }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("auth_user_id", user.id).maybeSingle(),
    supabase.from("owners").select("id").eq("auth_user_id", user.id).maybeSingle(),
  ]);

  return {
    authUserId: user.id,
    role: (roleRow?.role as AppRole | undefined) ?? null,
    ownerId: ownerRow?.id ?? null,
  };
}

export function canManage(role: AppRole | null) {
  return role === "super_admin" || role === "census_manager";
}
