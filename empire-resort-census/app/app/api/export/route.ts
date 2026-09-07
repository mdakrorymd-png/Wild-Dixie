import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, canManage } from "@/lib/auth";

// Pulls exclusively from the *_public_stats views (0005_views.sql) — none
// of them expose a personal column, by construction. This route does not
// touch owners / owner_names / owner_phones directly.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManage(user.role)) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const supabase = await createClient();
  const [{ data: overall }, { data: stages }, { data: positions }, { data: payment }, { data: participation }] =
    await Promise.all([
      supabase.from("owners_public_stats").select("*").single(),
      supabase.from("stage_public_stats").select("*"),
      supabase.from("main_position_public_stats").select("*"),
      supabase.from("payment_public_stats").select("*"),
      supabase.from("participation_public_stats").select("*"),
    ]);

  const lines: string[] = [];
  lines.push("# نظرة عامة");
  lines.push("المؤشر,القيمة");
  if (overall) {
    for (const [key, value] of Object.entries(overall)) lines.push(`${key},${value}`);
  }

  lines.push("");
  lines.push("# المراحل");
  lines.push("المرحلة,عدد الوحدات المعلنة,عدد المسجلين,تم التواصل,بيانات مكتملة");
  for (const s of stages ?? []) {
    lines.push(
      `${s.stage_label},${s.declared_unit_count ?? s.unit_count},${s.registered_count},${s.contacted_count},${s.census_complete_count}`
    );
  }

  lines.push("");
  lines.push("# المواقف العامة");
  lines.push("الموقف,عدد الردود,النسبة%");
  for (const p of positions ?? []) {
    lines.push(`"${p.position_text}",${p.response_count},${p.response_percent}`);
  }

  lines.push("");
  lines.push("# حالة السداد");
  lines.push("الحالة,عدد الملاك,النسبة%");
  for (const p of payment ?? []) {
    lines.push(`"${p.status}",${p.owner_count},${p.owner_percent}`);
  }

  lines.push("");
  lines.push("# المشاركة");
  lines.push("الخيار,عدد الردود");
  for (const p of participation ?? []) {
    lines.push(`"${p.option_text}",${p.response_count}`);
  }

  const csv = "﻿" + lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=empire-resort-stats.csv",
    },
  });
}
