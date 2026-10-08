import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";
import { CONTACT_OUTCOME_OPTIONS } from "@/lib/constants";
import { logQuickAttempt, registerAsVolunteerCandidate } from "./actions";

export default async function VolunteersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: myVolunteer } = await supabase
    .from("volunteers")
    .select("*, project_stages(label)")
    .eq("auth_user_id", user.authUserId)
    .maybeSingle();

  let assignedOwners: {
    id: string;
    contact_status: string | null;
    census_status: string | null;
    units: { unit_number: string } | null;
    owner_names: { full_name: string } | null;
  }[] = [];

  if (myVolunteer?.assigned_stage_id) {
    const { data } = await supabase
      .from("owners")
      .select("id, contact_status, census_status, units(unit_number), owner_names(full_name)")
      .order("created_at", { ascending: false });
    assignedOwners = (data ?? []) as unknown as typeof assignedOwners;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand">اعرف جارك</h1>
        <p className="text-sm text-muted">
          متطوعون يساعدون في التواصل مع ملاك منطقتهم — من غير الاطّلاع على بيانات تواصل غير
          المسندة لهم رسميًا.
        </p>
      </div>

      {!myVolunteer && !canManage(user.role) && (
        <form
          action={registerAsVolunteerCandidate}
          className="card space-y-3"
        >
          <p className="text-sm text-gray-700">سجّل نفسك كمتطوع — سيتم تحديد منطقتك بعد الموافقة.</p>
          <input name="full_name" className="input" placeholder="اسمك" required />
          <button className="btn-primary">تسجيل كمتطوع</button>
        </form>
      )}

      {myVolunteer && !myVolunteer.assigned_stage_id && (
        <div className="card text-sm text-amber-700">طلبك قيد المراجعة من فريق الإدارة.</div>
      )}

      {myVolunteer?.assigned_stage_id && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            المنطقة المسندة إليك: {(myVolunteer as { project_stages?: { label: string } }).project_stages?.label}
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-2 text-right">الوحدة</th>
                  <th className="p-2 text-right">الاسم</th>
                  <th className="p-2 text-right">حالة البيانات</th>
                  <th className="p-2 text-right">تسجيل تواصل</th>
                </tr>
              </thead>
              <tbody>
                {assignedOwners.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="p-2">{o.units?.unit_number}</td>
                    <td className="p-2">{o.owner_names?.full_name ?? "—"}</td>
                    <td className="p-2">{o.census_status}</td>
                    <td className="p-2">
                      <form action={logQuickAttempt.bind(null, o.id)} className="flex gap-1">
                        <select name="outcome" className="input">
                          {CONTACT_OUTCOME_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button className="btn-secondary">حفظ</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {assignedOwners.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      لا يوجد ملاك مسجّلين في منطقتك بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
