"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types";

function todayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "오늘도 파이팅";
  return "수고 많으셨어요";
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setMatches(data || []);
        setLoading(false);
      });
  }, []);

  const wins = matches.filter((m) => m.result === "win").length;

  return (
    <div className="page">
      <p className="text-sm text-neutral-500 mb-1">{todayGreeting()} 🎾</p>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Tennizip</h1>

      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="최근 5경기 승수" value={`${wins}승`} />
        <StatCard label="총 기록 경기" value={`${matches.length}경기`} />
      </div>

      <div className="flex gap-2.5 mb-8">
        <Link href="/matches/new" className="btn-primary flex-1">
          + 경기 기록
        </Link>
        <Link href="/dashboard" className="btn-outline flex-1">
          분석 보기
        </Link>
      </div>

      <h2 className="section-title">최근 경기</h2>
      {loading && <p className="text-sm text-neutral-400">불러오는 중...</p>}
      {!loading && matches.length === 0 && (
        <p className="text-sm text-neutral-400">
          아직 기록이 없어요. 첫 경기를 남겨보세요!
        </p>
      )}
      <ul className="flex flex-col gap-2.5">
        {matches.map((m) => (
          <li
            key={m.id}
            className="card px-4 py-3.5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-neutral-800">
                {m.match_date} · vs {m.opponent || "미기록"}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">{m.score}</p>
            </div>
            <span
              className={`badge ${m.result === "win" ? "badge-win" : "badge-loss"}`}
            >
              {m.result === "win" ? "승" : "패"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
    </div>
  );
}
