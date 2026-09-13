"use client";

import { useState, useTransition } from "react";
import { setUserRole } from "./actions";
import type { AppRole } from "@/lib/types";

const ROLES: AppRole[] = ["owner", "volunteer", "viewer", "census_manager", "super_admin"];

export default function RoleForm() {
  const [authUserId, setAuthUserId] = useState("");
  const [role, setRole] = useState<AppRole>("census_manager");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await setUserRole(authUserId, role);
      setMessage(result.error ?? "تم التحديث.");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-gray-600">auth_user_id</label>
        <input
          className="input"
          value={authUserId}
          onChange={(e) => setAuthUserId(e.target.value)}
          placeholder="uuid"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-600">الدور</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as AppRole)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary" disabled={pending}>
        {pending ? "جاري الحفظ..." : "تحديث الدور"}
      </button>
      {message && <p className="w-full text-sm text-gray-600">{message}</p>}
    </form>
  );
}
