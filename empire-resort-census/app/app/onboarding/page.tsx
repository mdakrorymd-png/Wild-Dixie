import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.ownerId) redirect("/survey");

  const supabase = await createClient();
  const [{ data: stages }, { data: units }] = await Promise.all([
    supabase.from("project_stages").select("*").order("key"),
    supabase.from("units_available").select("*").order("unit_number"),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-xl font-bold text-brand">تسجيل الوحدة</h1>
      <p className="mb-6 text-sm text-muted">
        اختر وحدتك وأدخل اسمك. البيانات دي مُدخلة منك مباشرة (self-reported) وبتظهر في الإحصاء
        فورًا — لو حصل نزاع على وحدة معينة بعدين هيتم مراجعتها بشكل استثنائي.
      </p>
      <OnboardingForm stages={stages ?? []} units={units ?? []} />
    </div>
  );
}
