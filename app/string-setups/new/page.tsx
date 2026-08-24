"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewStringSetupPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    racket_name: "",
    string_type: "",
    tension: "",
    strung_date: new Date().toISOString().slice(0, 10),
    feel_note: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase.from("string_setups").insert({
      racket_name: form.racket_name,
      string_type: form.string_type,
      tension: form.tension ? Number(form.tension) : null,
      strung_date: form.strung_date || null,
      feel_note: form.feel_note || null,
    });

    setSaving(false);

    if (error) {
      setError("저장에 실패했어요.");
      return;
    }
    router.push("/string-setups");
    router.refresh();
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        스트링 세팅 추가
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="라켓 이름">
          <input
            className="input"
            value={form.racket_name}
            onChange={(e) => setForm({ ...form, racket_name: e.target.value })}
            placeholder="예: 윌슨 블레이드 98"
          />
        </Field>
        <Field label="스트링 종류">
          <input
            className="input"
            value={form.string_type}
            onChange={(e) => setForm({ ...form, string_type: e.target.value })}
            placeholder="예: 루키올 엑스텐션"
          />
        </Field>
        <Field label="텐션 (lbs)">
          <input
            type="number"
            className="input"
            value={form.tension}
            onChange={(e) => setForm({ ...form, tension: e.target.value })}
            placeholder="예: 50"
          />
        </Field>
        <Field label="장착일">
          <input
            type="date"
            className="input"
            value={form.strung_date}
            onChange={(e) =>
              setForm({ ...form, strung_date: e.target.value })
            }
          />
        </Field>
        <Field label="체감 메모">
          <textarea
            className="input resize-none"
            rows={3}
            value={form.feel_note}
            onChange={(e) => setForm({ ...form, feel_note: e.target.value })}
            placeholder="파워/컨트롤/타구감 등 자유롭게"
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary mt-1">
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
