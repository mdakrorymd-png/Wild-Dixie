import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import ProgressBar from "@/components/ProgressBar";

export default async function StagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: stages } = await supabase.from("stage_public_stats").select("*").order("stage_key");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand">مقارنة المراحل</h1>
        <p className="text-sm text-muted">
          نفس المؤشرات مقسّمة على كل مرحلة تعاقدية — أرقام فقط، بدون أي تفسير لأسباب الفروق.
        </p>
      </div>

      {(stages ?? []).map((s) => (
        <div key={s.stage_id} className="card space-y-3">
          <h2 className="font-semibold text-brand">
            {s.stage_label} ({s.declared_unit_count ?? s.unit_count} وحدة)
          </h2>
          <div>
            <p className="mb-1 text-sm text-gray-700">تم التعرّف عليهم</p>
            <ProgressBar value={s.registered_count} total={s.declared_unit_count ?? s.unit_count} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>تم التواصل: {s.contacted_count}</p>
            <p>بيانات مكتملة: {s.census_complete_count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
