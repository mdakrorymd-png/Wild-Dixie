"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  MAIN_POSITION_FREE_TEXT_LABEL,
  PAYMENT_STATUS_OPTIONS,
  TOPIC_SECTIONS,
} from "@/lib/constants";

export interface SaveSurveyResult {
  error?: string;
  ok?: boolean;
}

export async function saveSurvey(formData: FormData): Promise<SaveSurveyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الجلسة منتهية." };

  const { data: owner } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!owner) return { error: "لا يوجد سجل مالك مرتبط بهذا الحساب." };

  const mainPositions = formData.getAll("main_position") as string[];
  const freeText = (formData.get("main_position_free_text") as string)?.trim() || null;
  const participation = formData.getAll("participation") as string[];
  const paymentStatus =
    (formData.get("payment_status") as string) || "غير محدد";

  // ── main positions: full replace ──
  await supabase.from("main_position_responses").delete().eq("owner_id", owner.id);
  if (mainPositions.length > 0) {
    const rows = mainPositions.map((position_text) => ({
      owner_id: owner.id,
      position_text,
      free_text: position_text === MAIN_POSITION_FREE_TEXT_LABEL ? freeText : null,
    }));
    const { error } = await supabase.from("main_position_responses").insert(rows);
    if (error) return { error: error.message };
  }

  // ── the 9 topic sections: upsert, skip empty ──
  for (const topic of TOPIC_SECTIONS) {
    const stance = (formData.get(`topic_${topic.key}`) as string)?.trim();
    if (!stance) continue;
    const detail = (formData.get(`topic_${topic.key}_detail`) as string)?.trim() || null;
    const { error } = await supabase
      .from("topic_responses")
      .upsert(
        { owner_id: owner.id, topic_key: topic.key, stance, detail },
        { onConflict: "owner_id,topic_key" }
      );
    if (error) return { error: error.message };
  }

  // ── participation: full replace ──
  await supabase.from("participation_responses").delete().eq("owner_id", owner.id);
  if (participation.length > 0) {
    const rows = participation.map((option_text) => ({ owner_id: owner.id, option_text }));
    const { error } = await supabase.from("participation_responses").insert(rows);
    if (error) return { error: error.message };
  }

  // ── payment status ──
  if (PAYMENT_STATUS_OPTIONS.includes(paymentStatus as (typeof PAYMENT_STATUS_OPTIONS)[number])) {
    const { error } = await supabase
      .from("payment_status")
      .upsert({ owner_id: owner.id, status: paymentStatus }, { onConflict: "owner_id" });
    if (error) return { error: error.message };
  }

  // ── census completion status, computed from what was actually filled ──
  const { count: topicCount } = await supabase
    .from("topic_responses")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", owner.id);

  const filledSections = [
    mainPositions.length > 0,
    (topicCount ?? 0) > 0,
    participation.length > 0,
    paymentStatus !== "غير محدد",
  ].filter(Boolean).length;

  const censusStatus =
    filledSections === 4 && (topicCount ?? 0) === TOPIC_SECTIONS.length
      ? "مكتمل"
      : filledSections === 0
        ? "لم يبدأ"
        : "جزئي";

  await supabase.from("owners").update({ census_status: censusStatus }).eq("id", owner.id);

  revalidatePath("/survey");
  revalidatePath("/me");
  return { ok: true };
}
