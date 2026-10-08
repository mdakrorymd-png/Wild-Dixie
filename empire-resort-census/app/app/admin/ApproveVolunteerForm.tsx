"use client";

import { useState, useTransition } from "react";
import { approveVolunteer } from "./actions";
import type { ProjectStageRow } from "@/lib/types";

export default function ApproveVolunteerForm({
  volunteerId,
  name,
  stages,
}: {
  volunteerId: string;
  name: string | null;
  stages: ProjectStageRow[];
}) {
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await approveVolunteer(volunteerId, stageId);
      setMessage(result.error ?? "تمت الموافقة.");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-t border-gray-100 py-2 text-sm">
      <span className="min-w-[8rem] font-medium">{name ?? "بدون اسم"}</span>
      <select className="input" value={stageId} onChange={(e) => setStageId(e.target.value)}>
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button className="btn-secondary" disabled={pending}>
        {pending ? "..." : "موافقة"}
      </button>
      {message && <span className="text-gray-500">{message}</span>}
    </form>
  );
}
