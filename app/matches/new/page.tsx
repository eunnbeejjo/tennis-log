"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StringSetup } from "@/lib/types";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function NewMatchPage() {
  const router = useRouter();
  const [stringSetups, setStringSetups] = useState<StringSetup[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    match_date: todayStr(),
    time_slot: "오후",
    opponent: "",
    score: "",
    result: "win" as "win" | "loss",
    court: "",
    condition_score: 3,
    memo: "",
    string_setup_id: "",
  });

  useEffect(() => {
    supabase
      .from("string_setups")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setStringSetups(data || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError("저장에 실패했어요.");
      return;
    }
    router.push("/matches");
    router.refresh();
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        경기 기록 추가
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="날짜">
          <input
            type="date"
            value={form.match_date}
            onChange={(e) => setForm({ ...form, match_date: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="시간대">
          <div className="flex gap-2">
            {["오전", "오후", "저녁"].map((t) => (
              <Chip
                key={t}
                active={form.time_slot === t}
                onClick={() => setForm({ ...form, time_slot: t })}
              >
                {t}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="상대">
          <input
            type="text"
            value={form.opponent}
            onChange={(e) => setForm({ ...form, opponent: e.target.value })}
            placeholder="상대 이름"
            className="input"
          />
        </Field>

        <Field label="스코어">
          <input
            type="text"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            placeholder="예: 6-4, 6-3"
            className="input"
          />
        </Field>

        <Field label="결과">
          <div className="flex gap-2">
            <Chip
              active={form.result === "win"}
              onClick={() => setForm({ ...form, result: "win" })}
            >
              승
            </Chip>
            <Chip
              active={form.result === "loss"}
              onClick={() => setForm({ ...form, result: "loss" })}
            >
              패
            </Chip>
          </div>
        </Field>

        <Field label="코트/장소">
          <input
            type="text"
            value={form.court}
            onChange={(e) => setForm({ ...form, court: e.target.value })}
            placeholder="예: 용인시립테니스장"
            className="input"
          />
        </Field>

        <Field label={`컨디션 (${form.condition_score}/5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={form.condition_score}
            onChange={(e) =>
              setForm({ ...form, condition_score: Number(e.target.value) })
            }
            className="w-full accent-court"
          />
        </Field>

        {stringSetups.length > 0 && (
          <Field label="스트링 세팅 (선택)">
            <select
              value={form.string_setup_id}
              onChange={(e) =>
                setForm({ ...form, string_setup_id: e.target.value })
              }
              className="input"
            >
              <option value="">선택 안 함</option>
              {stringSetups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.racket_name} · {s.string_type} {s.tension ?? ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="메모">
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            rows={3}
            className="input resize-none"
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary mt-1">
          {saving ? "저장 중... (날씨 조회 포함)" : "저장하기"}
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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "chip-active" : "chip-inactive"}
    >
      {children}
    </button>
  );
}
