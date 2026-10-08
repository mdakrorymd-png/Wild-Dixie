import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import SurveyForm from "./SurveyForm";

export default async function SurveyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.ownerId) redirect("/onboarding");

  const supabase = await createClient();
  const [
    { data: mainPositions },
    { data: topics },
    { data: participation },
    { data: payment },
    { data: generalNote },
  ] = await Promise.all([
    supabase.from("main_position_responses").select("*").eq("owner_id", user.ownerId),
    supabase.from("topic_responses").select("*").eq("owner_id", user.ownerId),
    supabase.from("participation_responses").select("*").eq("owner_id", user.ownerId),
    supabase.from("payment_status").select("*").eq("owner_id", user.ownerId).maybeSingle(),
    supabase.from("general_notes").select("*").eq("owner_id", user.ownerId).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-bold text-brand">الاستبيان</h1>
      <p className="mb-6 text-sm text-muted">
        كل الأسئلة دي بتساعدنا نعرف الصورة الحقيقية بس — مفيش إجابة &quot;صح&quot; أو
        &quot;غلط&quot;، ومفيش سؤال بيحسبلك نقاط أو يرتبك مع غيرك.
      </p>
      <SurveyForm
        initialMainPositions={mainPositions ?? []}
        initialTopics={topics ?? []}
        initialParticipation={participation ?? []}
        initialPaymentStatus={payment?.status ?? null}
        initialGeneralNote={generalNote?.note ?? null}
      />
    </div>
  );
}
