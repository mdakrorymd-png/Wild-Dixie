"use client";

import { useMemo, useState, useTransition } from "react";
import { registerOwner } from "./actions";
import type { ProjectStageRow, UnitAvailableRow } from "@/lib/types";

export default function OnboardingForm({
  stages,
  units,
}: {
  stages: ProjectStageRow[];
  units: UnitAvailableRow[];
}) {
  const [stageId, setStageId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredUnits = useMemo(
    () => (stageId ? units.filter((u) => u.stage_id === stageId) : units),
    [stageId, units]
  );

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerOwner(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-700">المرحلة</label>
        <select
          className="input"
          value={stageId}
          onChange={(e) => {
            setStageId(e.target.value);
            setUnitId("");
          }}
        >
          <option value="">كل المراحل</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">رقم الوحدة</label>
        <select
          name="unit_id"
          className="input"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          required
        >
          <option value="">اختر وحدتك</option>
          {filteredUnits.map((u) => (
            <option key={u.id} value={u.id}>
              {u.unit_number}
              {u.building ? ` — ${u.building}` : ""}
            </option>
          ))}
        </select>
        {filteredUnits.length === 0 && (
          <p className="mt-1 text-xs text-red-600">
            كل وحدات هذه المرحلة مسجّلة بالفعل، أو لا توجد وحدات محمّلة بعد.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">الاسم بالكامل</label>
        <input
          name="full_name"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "جاري التسجيل..." : "تسجيل والانتقال للاستبيان"}
      </button>
    </form>
  );
}
