"use client";

import { useState, useTransition } from "react";
import {
  MAIN_POSITION_QUESTION,
  MAIN_POSITION_OPTIONS,
  MAIN_POSITION_FREE_TEXT_LABEL,
  TOPIC_SECTIONS,
  TOPIC_SATISFACTION_OPTIONS,
  TOPIC_STANCE_OPTIONS,
  PARTICIPATION_QUESTION,
  PARTICIPATION_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/constants";
import type {
  MainPositionResponseRow,
  ParticipationResponseRow,
  TopicResponseRow,
} from "@/lib/types";
import { saveSurvey } from "./actions";

export default function SurveyForm({
  initialMainPositions,
  initialTopics,
  initialParticipation,
  initialPaymentStatus,
}: {
  initialMainPositions: MainPositionResponseRow[];
  initialTopics: TopicResponseRow[];
  initialParticipation: ParticipationResponseRow[];
  initialPaymentStatus: string | null;
}) {
  const initialFreeTextRow = initialMainPositions.find(
    (r) => r.position_text === MAIN_POSITION_FREE_TEXT_LABEL
  );
  const [selectedPositions, setSelectedPositions] = useState<string[]>(
    initialMainPositions.map((r) => r.position_text)
  );
  const [participation, setParticipation] = useState<string[]>(
    initialParticipation.map((r) => r.option_text)
  );
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const topicResponse = (key: string) => initialTopics.find((t) => t.topic_key === key);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function submit(formData: FormData) {
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const result = await saveSurvey(formData);
      if (result.error) {
        setStatus("error");
        setError(result.error);
      } else {
        setStatus("saved");
      }
    });
  }

  return (
    <form action={submit} className="space-y-8">
      <section className="card">
        <h2 className="mb-3 font-semibold text-brand">{MAIN_POSITION_QUESTION}</h2>
        <div className="space-y-2">
          {MAIN_POSITION_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="main_position"
                value={opt}
                checked={selectedPositions.includes(opt)}
                onChange={() => toggle(selectedPositions, setSelectedPositions, opt)}
                className="mt-1"
              />
              <span>{opt}</span>
            </label>
          ))}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="main_position"
              value={MAIN_POSITION_FREE_TEXT_LABEL}
              checked={selectedPositions.includes(MAIN_POSITION_FREE_TEXT_LABEL)}
              onChange={() =>
                toggle(selectedPositions, setSelectedPositions, MAIN_POSITION_FREE_TEXT_LABEL)
              }
              className="mt-1"
            />
            <span>{MAIN_POSITION_FREE_TEXT_LABEL}</span>
          </label>
          {selectedPositions.includes(MAIN_POSITION_FREE_TEXT_LABEL) && (
            <textarea
              name="main_position_free_text"
              className="input"
              rows={2}
              defaultValue={initialFreeTextRow?.free_text ?? ""}
              placeholder="اكتب رأيك هنا (اختياري)"
            />
          )}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold text-brand">أقسام مستقلة — رأيك في كل موضوع</h2>
        {TOPIC_SECTIONS.map((topic) => {
          const options =
            topic.type === "satisfaction" ? TOPIC_SATISFACTION_OPTIONS : TOPIC_STANCE_OPTIONS;
          const existing = topicResponse(topic.key);
          return (
            <div key={topic.key} className="space-y-2 border-b border-gray-100 pb-4 last:border-0">
              <label className="block text-sm font-medium text-gray-700">{topic.label}</label>
              <div className="flex flex-wrap gap-3">
                {options.map((opt) => (
                  <label key={opt} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`topic_${topic.key}`}
                      value={opt}
                      defaultChecked={existing?.stance === opt}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <textarea
                name={`topic_${topic.key}_detail`}
                className="input"
                rows={2}
                defaultValue={existing?.detail ?? ""}
                placeholder="تفاصيل إضافية (اختياري)"
              />
            </div>
          );
        })}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold text-brand">{PARTICIPATION_QUESTION}</h2>
        <div className="space-y-2">
          {PARTICIPATION_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="participation"
                value={opt}
                checked={participation.includes(opt)}
                onChange={() => toggle(participation, setParticipation, opt)}
                className="mt-1"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold text-brand">حالة السداد</h2>
        <select name="payment_status" className="input" defaultValue={initialPaymentStatus ?? ""}>
          <option value="">اختر</option>
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === "saved" && <p className="text-sm text-green-600">تم الحفظ بنجاح.</p>}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
