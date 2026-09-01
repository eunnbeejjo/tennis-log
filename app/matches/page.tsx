"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Spinner } from "@eunnbeejjo/ui";
import { supabase } from "@/lib/supabase";
import { CycleEntry, Match } from "@/lib/types";
import { getCyclePhase, simplifyPhase } from "@/lib/cycle";
import {
  formatOpponents,
  formatSets,
  resultBadgeVariant,
  resultLabel,
} from "@/lib/match";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false }),
      supabase.from("cycle_entries").select("*"),
    ]).then(([m, c]) => {
      setMatches(m.data || []);
      setCycleEntries(c.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">경기 기록</h1>
        <Button
          asChild
          size="sm"
          className="rounded-lg bg-court hover:bg-court-dark active:bg-court-dark focus-visible:ring-court/40"
        >
          <Link href="/matches/new">+ 추가</Link>
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-neutral-400 flex items-center gap-2">
          <Spinner size="sm" color="gray" /> 불러오는 중...
        </div>
      )}

      {!loading && matches.length === 0 && (
        <p className="text-sm text-neutral-400">
          아직 기록이 없어요. 첫 경기를 추가해보세요!
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {matches.map((m) => {
          const { phase } = getCyclePhase(m.match_date, cycleEntries);
          return (
            <li key={m.id}>
              <Link
                href={`/matches/${m.id}`}
                className="card p-4 block active:bg-neutral-50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">
                    {m.match_date} · {m.time_slot}
                  </span>
                  <Badge variant={resultBadgeVariant(m.result)}>
                    {resultLabel(m.result)}
                  </Badge>
                </div>
                <p className="mt-1.5 font-bold text-neutral-800">
                  vs {formatOpponents(m.opponents, m.opponent)}
                </p>
                {formatSets(m.sets, m.score) && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatSets(m.sets, m.score)}
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {m.court || "장소 미기록"}
                </p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="tag">
                    컨디션 {m.condition_score ?? "-"}/5
                  </span>
                  {phase !== "알 수 없음" && (
                    <span className="tag bg-cycle-light text-cycle">
                      {simplifyPhase(phase)}
                    </span>
                  )}
                  {m.weather_temp != null && (
                    <span className="tag">🌡️ {m.weather_temp}°C</span>
                  )}
                </div>
                {m.memo && (
                  <p className="text-sm text-neutral-600 mt-2.5">{m.memo}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
