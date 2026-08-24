"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CycleEntry } from "@/lib/types";
import { getAverageCycleLength, getCyclePhase } from "@/lib/cycle";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CyclePage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("cycle_entries")
      .select("*")
      .order("start_date", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("cycle_entries").insert({ start_date: date });
    setSaving(false);
    load();
  }

  const today = getCyclePhase(todayStr(), entries);
  const avgLength = getAverageCycleLength(entries);

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">생리주기</h1>

      <div className="bg-cycle-light border border-cycle/15 rounded-xl p-5 mb-6">
        <p className="text-sm text-neutral-500">오늘 기준</p>
        <p className="text-2xl font-bold text-cycle mt-1">
          {today.phase}
          {today.dayInCycle && ` · 주기 ${today.dayInCycle}일차`}
        </p>
        <p className="text-xs text-neutral-400 mt-1.5">
          평균 주기 {avgLength}일 (기록 {entries.length}개 기준)
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-7">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-cycle text-white rounded-xl px-5 text-sm font-semibold disabled:opacity-40 transition active:scale-[0.98]"
        >
          시작일 추가
        </button>
      </form>

      <h2 className="section-title">기록된 시작일</h2>
      {loading && <p className="text-sm text-neutral-400">불러오는 중...</p>}
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li key={e.id} className="card px-4 py-3 text-sm text-neutral-600">
            {e.start_date}
          </li>
        ))}
      </ul>
    </div>
  );
}
