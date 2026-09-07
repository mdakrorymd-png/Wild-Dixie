import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";
import RoleForm from "./RoleForm";
import ApproveVolunteerForm from "./ApproveVolunteerForm";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManage(user.role)) redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: disputedRaw }, { data: pendingVolunteers }, { data: stages }, { data: roles }] =
    await Promise.all([
      supabase
        .from("owners")
        .select("id, units(unit_number)")
        .eq("verification_status", "disputed"),
      supabase.from("volunteers").select("*").is("assigned_stage_id", null),
      supabase.from("project_stages").select("*").order("key"),
      user.role === "super_admin" ? supabase.from("user_roles").select("*") : Promise.resolve({ data: [] }),
    ]);
  const disputed = disputedRaw as unknown as
    | { id: string; units: { unit_number: string } | null }[]
    | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-brand">الإعدادات</h1>
      </div>

      <section className="card space-y-3">
        <h2 className="font-semibold text-brand">سجلات قيد النزاع ({(disputed ?? []).length})</h2>
        <p className="text-xs text-muted">
          هذه الوحدات مستبعدة من الإحصائيات العامة لحين المراجعة. راجعها من صفحة المالك نفسها.
        </p>
        <ul className="text-sm">
          {(disputed ?? []).map((d) => (
            <li key={d.id}>
              <Link href={`/owners/${d.id}`} className="text-brand hover:underline">
                وحدة {d.units?.unit_number ?? d.id}
              </Link>
            </li>
          ))}
          {(disputed ?? []).length === 0 && <p className="text-muted">لا يوجد.</p>}
        </ul>
      </section>

      {user.role === "super_admin" && (
        <>
          <section className="card space-y-3">
            <h2 className="font-semibold text-brand">
              طلبات تطوّع قيد الموافقة ({(pendingVolunteers ?? []).length})
            </h2>
            {(pendingVolunteers ?? []).map((v) => (
              <ApproveVolunteerForm key={v.id} volunteerId={v.id} name={v.full_name} stages={stages ?? []} />
            ))}
            {(pendingVolunteers ?? []).length === 0 && <p className="text-sm text-muted">لا يوجد.</p>}
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold text-brand">إدارة الأدوار</h2>
            <p className="text-xs text-muted">
              لتحويل مالك موجود إلى census_manager أو super_admin، استخدم رقم حساب المستخدم
              (auth_user_id) الموجود في قائمة الملاك.
            </p>
            <RoleForm />
            <div className="text-sm">
              <h3 className="mb-1 font-medium text-gray-700">الأدوار الحالية</h3>
              <ul className="space-y-1">
                {(roles ?? []).map((r) => (
                  <li key={r.auth_user_id} className="text-gray-600">
                    {r.auth_user_id} — {r.role}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
