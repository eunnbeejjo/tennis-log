"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CycleEntry, Match, StringSetup } from "@/lib/types";
import { getCyclePhase } from "@/lib/cycle";
import { formatOpponents, resultBadgeClass, resultLabel } from "@/lib/match";
import { formatStringTypes, formatTension } from "@/lib/stringSetup";

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [stringSetup, setStringSetup] = useState<StringSetup | null>(null);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: m }, { data: c }] = await Promise.all([
        supabase.from("matches").select("*").eq("id", id).maybeSingle(),
        supabase.from("cycle_entries").select("*"),
      ]);

      setMatch(m);
      setCycleEntries(c || []);

      if (m?.string_setup_id) {
        const { data: s } = await supabase
          .from("string_setups")
          .select("*")
          .eq("id", m.string_setup_id)
          .maybeSingle();
        setStringSetup(s);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <p className="page text-sm text-neutral-400">불러오는 중...</p>;
  }

  if (!match) {
    return (
      <div className="page">
        <p className="text-sm text-neutral-400 mb-4">기록을 찾을 수 없어요.</p>
        <Link href="/matches" className="text-sm font-semibold text-court">
          ← 목록으로
        </Link>
      </div>
    );
  }

  const { phase } = getCyclePhase(match.match_date, cycleEntries);
  const hasSetScores = Boolean(
    match.sets?.some((s) => s.my != null || s.opponent != null)
  );

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/matches"
          className="text-sm font-semibold text-neutral-400"
        >
          ← 목록
        </Link>
        <Link href={`/matches/${match.id}/edit`} className="btn-pill">
          수정
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-neutral-900">
          vs {formatOpponents(match.opponents, match.opponent)}
        </h1>
        <span className={`badge shrink-0 mt-1 ${resultBadgeClass(match.result)}`}>
          {resultLabel(match.result)}
        </span>
      </div>
      <p className="text-sm text-neutral-400 mb-6">
        {match.match_date} · {match.time_slot || "-"}
      </p>

      {hasSetScores && (
        <div className="card p-4 mb-4">
          <p className="section-title mb-2">세트 스코어</p>
          <div className="flex flex-col gap-1.5">
            {match.sets!.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">{i + 1}세트</span>
                <span className="font-medium text-neutral-800">
                  {s.my ?? "-"} - {s.opponent ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 flex flex-col gap-3 mb-4">
        {!hasSetScores && match.score && (
          <DetailRow label="스코어" value={match.score} />
        )}
        <DetailRow label="장소" value={match.court || "-"} />
        <DetailRow
          label="컨디션"
          value={`${match.condition_score ?? "-"}/5`}
        />
        {phase !== "알 수 없음" && (
          <DetailRow label="생리주기" value={phase} />
        )}
        {match.weather_temp != null && (
          <DetailRow
            label="날씨"
            value={`🌡️ ${match.weather_temp}°C${
              match.weather_humidity != null
                ? ` · 습도 ${match.weather_humidity}%`
                : ""
            }`}
          />
        )}
        {stringSetup && (
          <DetailRow
            label="스트링 세팅"
            value={`${stringSetup.racket_name} · ${formatStringTypes(
              stringSetup
            )} · ${formatTension(stringSetup)}`}
          />
        )}
      </div>

      {match.memo && (
        <div className="card p-4">
          <p className="section-title mb-2">메모</p>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">
            {match.memo}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm gap-4">
      <span className="text-neutral-400 shrink-0">{label}</span>
      <span className="font-medium text-neutral-800 text-right">
        {value}
      </span>
    </div>
  );
}
