// DEMO DATA — NOT REAL OWNERS.
//
// Populates a DEV Supabase project with fake units/owners/responses so the
// UI and dashboard can be exercised end-to-end. Every name/phone here is
// synthetic ("مالك تجريبي #0001", +2010000xxxx).
//
// SAFETY: this script uses the SERVICE ROLE key (it bypasses RLS on
// purpose, since it needs to write personal-looking demo rows directly).
// NEVER point SUPABASE_SERVICE_ROLE_KEY / SUPABASE_URL at the production
// project when running this. There is no confirmation prompt beyond the
// one below — read it.
//
// Run: cd empire-resort-census/app && npm run seed:demo
// Requires (in ../../supabase/seed/.env, not committed):
//   SUPABASE_URL=...            (the DEV project, not prod)
//   SUPABASE_SERVICE_ROLE_KEY=...

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(__dirname, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in supabase/seed/.env");
  process.exit(1);
}

if (!SUPABASE_URL.includes("localhost") && !process.env.I_UNDERSTAND_THIS_IS_A_DEV_PROJECT) {
  console.error(
    "Refusing to seed a non-localhost project without I_UNDERSTAND_THIS_IS_A_DEV_PROJECT=1.\n" +
      "This script writes fake owner data. Never run it against production."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const STAGES = [
  { key: "2007", label: "المرحلة الأولى", share: 0.42 },
  { key: "2010", label: "المرحلة الثانية", share: 0.33 },
  { key: "2013", label: "المرحلة الثالثة", share: 0.25 },
] as const;

const TOTAL_UNITS = 650;
const REGISTERED_SHARE = 0.38;

const MAIN_POSITIONS = [
  "أؤيد التحرك الجماعي للملاك",
  "أؤيد الحلول الودية والتفاوض",
  "أرى أن الحل يجب أن يكون من خلال الإجراءات القانونية",
  "أحتاج إلى معلومات وبيانات أكثر قبل اتخاذ موقف",
  "لدي اعتراضات على طريقة إدارة الملف الحالي",
  "أؤيد السداد / المشاركة في الحل الحالي",
  "لا أؤيد السداد قبل مراجعة المديونيات والمستندات",
  "لم أحدد موقفي بعد",
];

const PAYMENT_STATUSES = [
  "سدد الـ2000 جنيه",
  "لم يسدد",
  "ينوي السداد",
  "لديه اعتراض على السداد",
  "يحتاج معلومات قبل السداد",
  "يرى أن الملف يجب أن يسير قانونيًا",
  "غير محدد",
];

const PARTICIPATION_OPTIONS = [
  "نعم أريد المشاركة",
  "ربما لاحقًا",
  "لا أرغب حاليًا",
  "أريد فقط معرفة الأخبار",
  "لجان أو مجموعات عمل",
  "الجوانب القانونية",
  "الجوانب المالية والمراجعة",
  "التطوير والمشروعات",
  "التواصل مع باقي الملاك",
];

const TOPIC_KEYS = [
  "electricity",
  "water",
  "maintenance",
  "management",
  "developer",
  "legal",
  "collective",
  "future",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSome<T>(arr: readonly T[], max: number): T[] {
  const n = 1 + Math.floor(Math.random() * max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  console.log("Seeding DEMO data (not real owners) into", SUPABASE_URL);

  const stageIds: Record<string, string> = {};
  for (const s of STAGES) {
    const { data, error } = await supabase
      .from("project_stages")
      .upsert({ key: s.key, label: s.label, declared_unit_count: Math.round(TOTAL_UNITS * s.share) }, { onConflict: "key" })
      .select("id")
      .single();
    if (error) throw error;
    stageIds[s.key] = data.id;
  }

  const unitRows: { unit_number: string; stage_id: string; building: string; zone: string }[] = [];
  let counter = 1;
  for (const s of STAGES) {
    const count = Math.round(TOTAL_UNITS * s.share);
    for (let i = 0; i < count; i++) {
      unitRows.push({
        unit_number: `DEMO-${s.key}-${String(counter).padStart(4, "0")}`,
        stage_id: stageIds[s.key],
        building: `مبنى ${1 + (i % 12)}`,
        zone: `منطقة ${1 + (i % 6)}`,
      });
      counter++;
    }
  }

  console.log(`Inserting ${unitRows.length} demo units...`);
  const { data: insertedUnits, error: unitsError } = await supabase
    .from("units")
    .upsert(unitRows, { onConflict: "unit_number" })
    .select("id, unit_number");
  if (unitsError) throw unitsError;

  const registeredCount = Math.round((insertedUnits?.length ?? 0) * REGISTERED_SHARE);
  const shuffledUnits = [...(insertedUnits ?? [])].sort(() => Math.random() - 0.5);
  const unitsToRegister = shuffledUnits.slice(0, registeredCount);

  console.log(`Registering ${unitsToRegister.length} demo owners...`);
  for (let i = 0; i < unitsToRegister.length; i++) {
    const unit = unitsToRegister[i];
    const verification = i % 20 === 0 ? "disputed" : i % 7 === 0 ? "confirmed" : "self_reported";

    const { data: owner, error: ownerError } = await supabase
      .from("owners")
      .insert({
        unit_id: unit.id,
        verification_status: verification,
        contact_status: pick(["تم التواصل", "لم يتم التواصل"] as const),
        census_status: pick(["مكتمل", "جزئي", "لم يبدأ"] as const),
      })
      .select("id")
      .single();
    if (ownerError) throw ownerError;

    await supabase.from("owner_names").insert({
      owner_id: owner.id,
      full_name: `مالك تجريبي #${String(i + 1).padStart(4, "0")}`,
    });
    await supabase.from("owner_phones").insert({
      owner_id: owner.id,
      phone: `+2010${String(10000000 + i).slice(0, 8)}`,
    });

    if (verification === "disputed") continue; // no survey noise on disputed demo rows

    await supabase.from("main_position_responses").insert(
      pickSome(MAIN_POSITIONS, 3).map((position_text) => ({ owner_id: owner.id, position_text }))
    );
    await supabase.from("participation_responses").insert(
      pickSome(PARTICIPATION_OPTIONS, 3).map((option_text) => ({ owner_id: owner.id, option_text }))
    );
    await supabase.from("payment_status").insert({ owner_id: owner.id, status: pick(PAYMENT_STATUSES) });

    const topicsToFill = pickSome(TOPIC_KEYS, TOPIC_KEYS.length);
    await supabase.from("topic_responses").insert(
      topicsToFill.map((topic_key) => ({
        owner_id: owner.id,
        topic_key,
        stance: `رأي تجريبي عشوائي حول ${topic_key} — بيانات ديمو فقط.`,
      }))
    );
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
