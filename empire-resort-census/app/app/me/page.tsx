import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.ownerId) redirect("/onboarding");

  const supabase = await createClient();
  const [{ data: owner }, { data: name }, { data: phone }, { data: payment }] = await Promise.all([
    supabase
      .from("owners")
      .select("*, units(unit_number, stage_id, building, zone)")
      .eq("id", user.ownerId)
      .single(),
    supabase.from("owner_names").select("full_name").eq("owner_id", user.ownerId).maybeSingle(),
    supabase.from("owner_phones").select("phone").eq("owner_id", user.ownerId).maybeSingle(),
    supabase.from("payment_status").select("status").eq("owner_id", user.ownerId).maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand">بياناتي</h1>
        <p className="text-sm text-muted">
          دي بياناتك إنت بس — محدش تاني بيشوفها غير فريق الإحصاء عشان التواصل معاك.
        </p>
      </div>

      <div className="card grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <p>الاسم: {name?.full_name ?? "—"}</p>
        <p>التليفون: {phone?.phone ?? "—"}</p>
        <p>الوحدة: {owner?.units?.unit_number ?? "—"}</p>
        <p>حالة التحقق: {owner?.verification_status}</p>
        <p>حالة البيانات: {owner?.census_status}</p>
        <p>حالة السداد: {payment?.status ?? "غير محدد"}</p>
      </div>

      <Link href="/survey" className="btn-primary inline-block">
        تعديل إجاباتي على الاستبيان
      </Link>
    </div>
  );
}
