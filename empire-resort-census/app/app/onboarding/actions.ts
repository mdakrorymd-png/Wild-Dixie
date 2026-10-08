"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface RegisterResult {
  error?: string;
}

// Free-typed unit numbers, not a pre-loaded list — no real 650-unit roster
// was ever provided (see README). Normalizing before storing/matching
// (case + whitespace/dash-insensitive) is what keeps the DB-level
// de-duplication requirement real despite free text: "A-101", "a 101" and
// "A101" all resolve to the same underlying unit row, and
// owners.unit_id UNIQUE (0001_schema.sql) still blocks a second owner
// from claiming it.
function normalizeUnitNumber(raw: string) {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, "");
}

// Runs as the authenticated caller (not service-role), so every insert
// here is still subject to the RLS policies in 0004_rls.sql/0007_units_self_insert.sql
// — the unit UNIQUE constraint and the phone UNIQUE constraint are what
// actually stop double-registration, not this function's logic. Login is
// by email OTP (see app/login), so the phone entered here is
// self-reported, same as the name — its only enforcement is the DB
// uniqueness constraint.
export async function registerOwner(formData: FormData): Promise<RegisterResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الجلسة منتهية، برجاء تسجيل الدخول من جديد." };

  const stageId = formData.get("stage_id") as string;
  const unitNumberRaw = (formData.get("unit_number") as string)?.trim();
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  if (!stageId || !unitNumberRaw || !fullName || !phone) {
    return { error: "برجاء اختيار المرحلة وكتابة رقم الوحدة والاسم ورقم التليفون." };
  }

  const unitNumber = normalizeUnitNumber(unitNumberRaw);

  const { data: existingUnit } = await supabase
    .from("units")
    .select("id")
    .eq("unit_number", unitNumber)
    .maybeSingle();

  let unitId: string;
  if (existingUnit) {
    unitId = existingUnit.id;
  } else {
    const { data: newUnit, error: unitError } = await supabase
      .from("units")
      .insert({ unit_number: unitNumber, stage_id: stageId })
      .select("id")
      .single();

    if (unitError && unitError.code !== "23505") {
      return { error: unitError.message };
    }

    if (unitError) {
      // Race: another registration created the same unit between our
      // select and insert. Fetch the row it created instead.
      const { data: raceUnit } = await supabase
        .from("units")
        .select("id")
        .eq("unit_number", unitNumber)
        .maybeSingle();
      if (!raceUnit) return { error: unitError.message };
      unitId = raceUnit.id;
    } else {
      unitId = newUnit!.id;
    }
  }

  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .insert({ auth_user_id: user.id, unit_id: unitId })
    .select("id")
    .single();

  if (ownerError) {
    if (ownerError.code === "23505") {
      return { error: "هذه الوحدة مسجّلة بالفعل، أو لديك حساب مسجّل من قبل." };
    }
    return { error: ownerError.message };
  }

  const { error: nameError } = await supabase
    .from("owner_names")
    .insert({ owner_id: owner.id, full_name: fullName });
  if (nameError) return { error: nameError.message };

  const { error: phoneError } = await supabase
    .from("owner_phones")
    .insert({ owner_id: owner.id, phone });
  if (phoneError) {
    if (phoneError.code === "23505") {
      return { error: "رقم التليفون ده مسجّل بالفعل على وحدة تانية." };
    }
    return { error: phoneError.message };
  }

  redirect("/survey");
}
