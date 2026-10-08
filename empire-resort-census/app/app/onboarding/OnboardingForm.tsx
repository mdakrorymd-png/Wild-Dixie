"use client";

import { useState, useTransition } from "react";
import { registerOwner } from "./actions";
import type { ProjectStageRow } from "@/lib/types";

export default function OnboardingForm({ stages }: { stages: ProjectStageRow[] }) {
  const [stageId, setStageId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          name="stage_id"
          className="input"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          required
        >
          <option value="">اختر المرحلة</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">رقم الوحدة</label>
        <input
          name="unit_number"
          className="input"
          placeholder="مثال: A-101"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          required
        />
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

      <div>
        <label className="mb-1 block text-sm text-gray-700">رقم التليفون</label>
        <input
          name="phone"
          type="tel"
          className="input"
          placeholder="+201xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
