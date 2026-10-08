import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import BarChartCard from "@/components/BarChartCard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ data: stats }, { data: stages }, { data: positions }] = await Promise.all([
    supabase.from("owners_public_stats").select("*").single(),
    supabase.from("stage_public_stats").select("*").order("stage_key"),
    supabase
      .from("main_position_public_stats")
      .select("*")
      .order("response_count", { ascending: false })
      .limit(5),
  ]);

  const total = stats?.total_units ?? 650;
  const registered = stats?.total_registered ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand">لوحة البيانات</h1>
          <p className="text-sm text-muted">
            كل الأرقام هنا إحصائية مجمّعة فقط — من غير أي بيانات شخصية. الهدف: نعرف الموقف، لا
            نصنعه.
          </p>
        </div>
        {canManage(user.role) && (
          <a href="/api/export" className="btn-secondary whitespace-nowrap">
            تصدير CSV
          </a>
        )}
      </div>

      <div className="card">
        <p className="mb-2 text-sm font-medium text-gray-700">
          {registered} / {total} مالك تم التعرّف عليهم
        </p>
        <ProgressBar value={registered} total={total} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="تم التواصل" value={stats?.contacted_count ?? 0} />
        <StatCard label="لم يتم التواصل" value={stats?.not_contacted_count ?? 0} />
        <StatCard label="بيانات مكتملة" value={stats?.census_complete_count ?? 0} />
        <StatCard label="بيانات جزئية" value={stats?.census_partial_count ?? 0} />
        <StatCard label="لم يبدأ" value={stats?.census_not_started_count ?? 0} />
        <StatCard
          label="قيد المراجعة (نزاع)"
          value={stats?.total_disputed ?? 0}
          sub="لا تُحتسب ضمن الإحصائيات العامة"
        />
      </div>

      <BarChartCard
        title="توزيع المراحل — عدد المسجّلين"
        data={(stages ?? []).map((s) => ({ name: s.stage_label, count: s.registered_count }))}
        dataKey="count"
        nameKey="name"
      />

      <BarChartCard
        title="أعلى 5 مواقف عامة"
        data={(positions ?? []).map((p) => ({ name: p.position_text, count: p.response_count }))}
        dataKey="count"
        nameKey="name"
        color="#B8863B"
      />
    </div>
  );
}
