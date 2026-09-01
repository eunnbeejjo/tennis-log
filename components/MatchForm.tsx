"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@eunnbeejjo/ui";
import { supabase } from "@/lib/supabase";
import { Match, SetScore, StringSetup } from "@/lib/types";
import { formatStringTypes, formatTension } from "@/lib/stringSetup";

const MAX_OPPONENTS = 5;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptySet(): SetScore {
  return { my: null, opponent: null };
}

interface FormState {
  match_date: string;
  time_slot: string;
  opponents: string[];
  sets: SetScore[];
  result: "win" | "draw" | "loss";
  court: string;
  condition_score: number;
  memo: string;
  string_setup_id: string;
}

function toFormState(m?: Match): FormState {
  return {
    match_date: m?.match_date || todayStr(),
    time_slot: m?.time_slot || "오후",
    opponents:
      m?.opponents && m.opponents.length > 0
        ? m.opponents
        : m?.opponent
        ? [m.opponent]
        : [""],
    sets:
      m?.sets && m.sets.length > 0
        ? m.sets
        : [emptySet(), emptySet(), emptySet()],
    result: (m?.result as "win" | "draw" | "loss") || "win",
    court: m?.court || "",
    condition_score: m?.condition_score ?? 3,
    memo: m?.memo || "",
    string_setup_id: m?.string_setup_id || "",
  };
}

export default function MatchForm({
  matchId,
  initial,
}: {
  matchId?: string;
  initial?: Match;
}) {
  const router = useRouter();
  const [stringSetups, setStringSetups] = useState<StringSetup[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(toFormState(initial));

  useEffect(() => {
    supabase
      .from("string_setups")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setStringSetups(data || []));
  }, []);

  function updateOpponent(i: number, value: string) {
    const next = [...form.opponents];
    next[i] = value;
    setForm({ ...form, opponents: next });
  }

  function addOpponent() {
    if (form.opponents.length >= MAX_OPPONENTS) return;
    setForm({ ...form, opponents: [...form.opponents, ""] });
  }

  function removeOpponent(i: number) {
    const next = form.opponents.filter((_, idx) => idx !== i);
    setForm({ ...form, opponents: next.length > 0 ? next : [""] });
  }

  function updateSet(i: number, key: keyof SetScore, value: string) {
    const next = [...form.sets];
    next[i] = { ...next[i], [key]: value === "" ? null : Number(value) };
    setForm({ ...form, sets: next });
  }

  function addSet() {
    setForm({ ...form, sets: [...form.sets, emptySet()] });
  }

  function removeSet(i: number) {
    const next = form.sets.filter((_, idx) => idx !== i);
    setForm({ ...form, sets: next.length > 0 ? next : [emptySet()] });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      opponents: form.opponents.map((o) => o.trim()).filter(Boolean),
      string_setup_id: form.string_setup_id || null,
    };

    if (matchId) {
      // 수정: 날씨는 최초 등록 시 값을 그대로 유지 (서버 전용 API 키가 필요해 클라이언트에서는 재조회하지 않음)
      const { error } = await supabase
        .from("matches")
        .update(payload)
        .eq("id", matchId);

      setSaving(false);
      if (error) {
        setError("저장에 실패했어요.");
        return;
      }
      router.push(`/matches/${matchId}`);
      router.refresh();
      return;
    }

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        type="date"
        label="날짜"
        value={form.match_date}
        onChange={(e) => setForm({ ...form, match_date: e.target.value })}
        className="rounded-xl focus-visible:ring-court/40"
      />

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

      <Field label={`상대 (최대 ${MAX_OPPONENTS}명)`}>
        <div className="flex flex-col gap-2">
          {form.opponents.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateOpponent(i, e.target.value)}
                placeholder="상대 이름"
                className="input flex-1"
              />
              {form.opponents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOpponent(i)}
                  aria-label="상대 삭제"
                  className="w-11 h-11 shrink-0 rounded-xl border border-neutral-200 text-neutral-400 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {form.opponents.length < MAX_OPPONENTS && (
            <button
              type="button"
              onClick={addOpponent}
              className="self-start text-xs font-semibold text-court"
            >
              + 상대 추가
            </button>
          )}
        </div>
      </Field>

      <Field label="세트 스코어 (게임 수는 선택 입력)">
        <div className="flex flex-col gap-2">
          {form.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-400 w-10 shrink-0">
                {i + 1}세트
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={s.my ?? ""}
                onChange={(e) => updateSet(i, "my", e.target.value)}
                placeholder="나"
                className="input w-16 text-center px-1"
              />
              <span className="text-neutral-300">-</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={s.opponent ?? ""}
                onChange={(e) => updateSet(i, "opponent", e.target.value)}
                placeholder="상대"
                className="input w-16 text-center px-1"
              />
              {form.sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  aria-label="세트 삭제"
                  className="w-9 h-9 shrink-0 rounded-xl border border-neutral-200 text-neutral-400 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSet}
            className="self-start text-xs font-semibold text-court"
          >
            + 세트 추가
          </button>
        </div>
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
            active={form.result === "draw"}
            onClick={() => setForm({ ...form, result: "draw" })}
          >
            무
          </Chip>
          <Chip
            active={form.result === "loss"}
            onClick={() => setForm({ ...form, result: "loss" })}
          >
            패
          </Chip>
        </div>
      </Field>

      <Input
        type="text"
        label="코트/장소"
        value={form.court}
        onChange={(e) => setForm({ ...form, court: e.target.value })}
        placeholder="예: 용인시립테니스장"
        className="rounded-xl focus-visible:ring-court/40"
      />

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
        <Select
          label="스트링 세팅 (선택)"
          placeholder="선택 안 함"
          value={form.string_setup_id}
          onChange={(value) => setForm({ ...form, string_setup_id: value })}
          className="rounded-xl focus-visible:ring-court/40"
          options={[
            { value: "", label: "선택 안 함" },
            ...stringSetups.map((s) => ({
              value: s.id,
              label: `${s.racket_name} · ${formatStringTypes(s)} ${formatTension(s)}`,
            })),
          ]}
        />
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

      <Button
        type="submit"
        isLoading={saving}
        className="mt-1 rounded-xl bg-court hover:bg-court-dark active:bg-court-dark focus-visible:ring-court/40"
      >
        {saving
          ? matchId
            ? "저장 중..."
            : "저장 중... (날씨 조회 포함)"
          : matchId
          ? "수정 완료"
          : "저장하기"}
      </Button>
    </form>
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
    <Button
      type="button"
      size="sm"
      variant={active ? "primary" : "outline"}
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-court hover:bg-court-dark active:bg-court-dark focus-visible:ring-court/40"
          : "rounded-lg border-neutral-200 hover:bg-neutral-50 focus-visible:ring-court/40"
      }
    >
      {children}
    </Button>
  );
}
