"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CycleEntry, Match, StringSetup } from "@/lib/types";
import { getCyclePhase } from "@/lib/cycle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function winRate(matches: Match[]): number {
  if (matches.length === 0) return 0;
  const wins = matches.filter((m) => m.result === "win").length;
  return Math.round((wins / matches.length) * 100);
}

function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!out[key]) out[key] = [];
    out[key].push(item);
  }
  return out;
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [stringSetups, setStringSetups] = useState<StringSetup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("matches").select("*"),
      supabase.from("cycle_entries").select("*"),
      supabase.from("string_setups").select("*"),
    ]).then(([m, c, s]) => {
      setMatches(m.data || []);
      setCycleEntries(c.data || []);
      setStringSetups(s.data || []);
      setLoading(false);
    });
  }, []);

  const byPhase = useMemo(() => {
    const withPhase = matches.map((m) => ({
      ...m,
      phase: getCyclePhase(m.match_date, cycleEntries).phase,
    }));
    const grouped = groupBy(withPhase, (m) => m.phase);
    return Object.entries(grouped).map(([phase, list]) => ({
      phase,
      승률: winRate(list),
      평균컨디션:
        Math.round(
          (list.reduce((sum, m) => sum + (m.condition_score || 0), 0) /
            list.length) *
            10
        ) / 10,
      경기수: list.length,
    }));
  }, [matches, cycleEntries]);

  const byTimeSlot = useMemo(() => {
    const grouped = groupBy(
      matches.filter((m) => m.time_slot),
      (m) => m.time_slot as string
    );
    return Object.entries(grouped).map(([slot, list]) => ({
      slot,
      승률: winRate(list),
      경기수: list.length,
    }));
  }, [matches]);

  const byWeekday = useMemo(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const grouped = groupBy(matches, (m) => days[new Date(m.match_date).getDay()]);
    return days
      .filter((d) => grouped[d])
      .map((d) => ({
        요일: d,
        승률: winRate(grouped[d]),
        경기수: grouped[d].length,
      }));
  }, [matches]);

  const byCourt = useMemo(() => {
    const withCourt = matches.filter((m) => m.court);
    const grouped = groupBy(withCourt, (m) => m.court as string);
    return Object.entries(grouped)
      .map(([court, list]) => ({
        court,
        승률: winRate(list),
        경기수: list.length,
      }))
      .sort((a, b) => b.경기수 - a.경기수);
  }, [matches]);

  const byStringSetup = useMemo(() => {
    const withSetup = matches.filter((m) => m.string_setup_id);
    const grouped = groupBy(withSetup, (m) => m.string_setup_id as string);
    return Object.entries(grouped).map(([id, list]) => {
      const setup = stringSetups.find((s) => s.id === id);
      return {
        name: setup ? `${setup.racket_name} ${setup.tension ?? ""}lbs` : "알 수 없음",
        평균컨디션:
          Math.round(
            (list.reduce((sum, m) => sum + (m.condition_score || 0), 0) /
              list.length) *
              10
          ) / 10,
        경기수: list.length,
      };
    });
  }, [matches, stringSetups]);

  if (loading) {
    return <p className="page text-sm text-neutral-400">불러오는 중...</p>;
  }

  if (matches.length === 0) {
    return (
      <p className="page text-sm text-neutral-400">
        경기 기록을 몇 개 쌓으면 여기서 분석을 볼 수 있어요.
      </p>
    );
  }

  return (
    <div className="page flex flex-col gap-7">
      <h1 className="text-2xl font-bold text-neutral-900">분석</h1>

      <Section title="생리주기 단계별 승률 · 컨디션">
        <MiniBarChart data={byPhase} xKey="phase" yKey="승률" />
        <ul className="mt-3 text-xs text-neutral-500 flex flex-col gap-1">
          {byPhase.map((p) => (
            <li key={p.phase}>
              {p.phase} — 승률 {p.승률}% · 평균 컨디션 {p.평균컨디션} ·{" "}
              {p.경기수}경기
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-neutral-400 mt-2">
          ※ 참고용 통계예요. 경기 수가 적으면 오차가 클 수 있어요.
        </p>
      </Section>

      <Section title="시간대별 승률">
        <MiniBarChart data={byTimeSlot} xKey="slot" yKey="승률" />
      </Section>

      <Section title="요일별 승률">
        <MiniBarChart data={byWeekday} xKey="요일" yKey="승률" />
      </Section>

      {byCourt.length > 0 && (
        <Section title="테니스장별 승률">
          <ul className="flex flex-col gap-2">
            {byCourt.map((c) => (
              <li
                key={c.court}
                className="card text-sm px-4 py-3 flex justify-between"
              >
                <span className="font-medium text-neutral-700">
                  {c.court}
                </span>
                <span className="text-neutral-400">
                  승률 {c.승률}% · {c.경기수}경기
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {byStringSetup.length > 0 && (
        <Section title="스트링 세팅별 평균 컨디션">
          <ul className="flex flex-col gap-2">
            {byStringSetup.map((s) => (
              <li
                key={s.name}
                className="card text-sm px-4 py-3 flex justify-between"
              >
                <span className="font-medium text-neutral-700">{s.name}</span>
                <span className="text-neutral-400">
                  컨디션 {s.평균컨디션} · {s.경기수}경기
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <h2 className="section-title mb-3">{title}</h2>
      {children}
    </div>
  );
}

function MiniBarChart({
  data,
  xKey,
  yKey,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
}) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
          <XAxis dataKey={xKey} fontSize={11} stroke="#A1A1AA" />
          <YAxis fontSize={11} width={28} stroke="#A1A1AA" />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E4E4E7",
              fontSize: 12,
            }}
          />
          <Bar dataKey={yKey} fill="#12805B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
